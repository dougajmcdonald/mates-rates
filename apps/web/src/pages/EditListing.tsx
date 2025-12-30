import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    price: z.coerce.number().min(0, "Price must be positive"),
    category: z.string().min(1, "Category is required"),
})

export default function EditListing() {
    const { id } = useParams()
    const { session, user } = useAuth()
    const navigate = useNavigate()
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [existingImages, setExistingImages] = useState<string[]>([])

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    useEffect(() => {
        if (session?.access_token && id) {
            // Fetch all listings and filter (matching ListingDetails logic due to lack of single endpoint yet)
            // Or actually, ListingDetails logic was temporary.
            // We really should use the FIND ALL endpoint and filter, 
            // OR add a proper single GET endpoint. 
            // For consistent MVP, let's just stick to the pattern we used in ListingDetails.
            fetch(`${import.meta.env.VITE_API_URL}/api/listings`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            })
                .then(res => res.json())
                .then(data => {
                    const found = data.listings?.find((l: any) => l.id === Number(id))
                    if (found) {
                        // Verify ownership
                        if (found.userId !== user?.id) {
                            alert('Unauthorized')
                            navigate('/dashboard')
                            return
                        }

                        setValue('title', found.title)
                        setValue('description', found.description)
                        setValue('price', found.price / 100) // Convert cents to units
                        setValue('category', found.category)
                        setExistingImages(found.images || [])
                    } else {
                        alert('Listing not found')
                        navigate('/dashboard')
                    }
                })
                .finally(() => setLoading(false))
        }
    }, [id, session, user, navigate, setValue])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setUploading(true)
            let imageUrls: string[] = [...existingImages]

            if (selectedImages.length > 0) {
                // Upload new images
                const uploadPromises = selectedImages.map(async (file) => {
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${Math.random()}.${fileExt}`
                    const filePath = `${fileName}`

                    const { error: uploadError } = await supabase.storage
                        .from('listings')
                        .upload(filePath, file)

                    if (uploadError) throw uploadError

                    const { data } = supabase.storage.from('listings').getPublicUrl(filePath)
                    return data.publicUrl
                })

                const newUrls = await Promise.all(uploadPromises)
                imageUrls = [...imageUrls, ...newUrls]
            }

            // Update listing on backend
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/listings/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    ...values,
                    images: imageUrls,
                    price: Math.round(values.price * 100)
                })
            })

            if (!response.ok) throw new Error('Failed to update listing')

            navigate(`/listings/${id}`)
        } catch (error) {
            console.error(error)
            alert('Error updating listing')
        } finally {
            setUploading(false)
        }
    }

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index))
    }

    const removeSelectedImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index])
            return prev.filter((_, i) => i !== index)
        })
    }

    const onSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files)
            const currentTotal = existingImages.length + selectedImages.length

            if (currentTotal + filesArray.length > 10) {
                alert(`You can only have a maximum of 10 images. You currently have ${currentTotal} and are trying to add ${filesArray.length}.`)
                return
            }

            setSelectedImages(prev => [...prev, ...filesArray])

            const newPreviews = filesArray.map(file => URL.createObjectURL(file))
            setPreviews(prev => [...prev, ...newPreviews])
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="container mx-auto max-w-2xl py-10">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Listing</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Title</label>
                            <Input id="title" placeholder="Vintage Lamp" {...register("title")} />
                            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Description</label>
                            <Textarea id="description" placeholder="Great condition..." {...register("description")} />
                            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="price" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Price (£)</label>
                                <Input type="number" step="0.01" id="price" {...register("price")} />
                                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="category" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Category</label>
                                <Input id="category" placeholder="Furniture" {...register("category")} />
                                {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Images (Max 10)</label>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Existing Images</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {existingImages.map((src, index) => (
                                            <div key={`existing-${index}`} className="relative aspect-square w-full overflow-hidden rounded-md border">
                                                <img src={src} alt={`Existing ${index}`} className="h-full w-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(index)}
                                                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none"
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Uploads */}
                            <div>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={onSelectImages}
                                    disabled={existingImages.length + selectedImages.length >= 10}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {existingImages.length + selectedImages.length}/10 images total
                                </p>
                            </div>

                            {/* Previews of New Images */}
                            {previews.length > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">New Images</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {previews.map((src, index) => (
                                            <div key={`new-${index}`} className="relative aspect-square w-full overflow-hidden rounded-md border">
                                                <img src={src} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeSelectedImage(index)}
                                                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none"
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting || uploading}>
                            {(isSubmitting || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Listing
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
