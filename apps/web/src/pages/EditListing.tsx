import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { useNavigate, useParams } from "react-router-dom"
import { Loader2, ArrowLeft, X } from "lucide-react"

const formSchema = z.object({
    title: z.string().min(2, { message: "Title must be at least 2 characters." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
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
            fetch(`${import.meta.env.VITE_API_URL}/api/listings`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    const found = data.listings?.find((l: any) => l.id === Number(id))
                    if (found) {
                        if (found.userId !== user?.id) {
                            alert("Unauthorized")
                            navigate("/dashboard")
                            return
                        }
                        setValue("title", found.title)
                        setValue("description", found.description)
                        setValue("price", found.price / 100)
                        setValue("category", found.category)
                        setExistingImages(found.images || [])
                    } else {
                        alert("Listing not found")
                        navigate("/dashboard")
                    }
                })
                .finally(() => setLoading(false))
        }
    }, [id, session, user, navigate, setValue])

    const onSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const filesArray = Array.from(e.target.files)
        const currentTotal = existingImages.length + selectedImages.length
        if (currentTotal + filesArray.length > 10) {
            alert(`You can only have 10 images. Currently ${currentTotal}, adding ${filesArray.length}.`)
            return
        }
        setSelectedImages((prev) => [...prev, ...filesArray])
        setPreviews((prev) => [...prev, ...filesArray.map((f) => URL.createObjectURL(f))])
    }

    const removeExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index))
    }

    const removeSelectedImage = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index))
        setPreviews((prev) => {
            URL.revokeObjectURL(prev[index])
            return prev.filter((_, i) => i !== index)
        })
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setUploading(true)
            let imageUrls = [...existingImages]

            if (selectedImages.length > 0) {
                const uploadPromises = selectedImages.map(async (file) => {
                    const fileExt = file.name.split(".").pop()
                    const fileName = `${Math.random()}.${fileExt}`
                    const { error: uploadError } = await supabase.storage.from("listings").upload(fileName, file)
                    if (uploadError) throw uploadError
                    return supabase.storage.from("listings").getPublicUrl(fileName).data.publicUrl
                })
                imageUrls = [...imageUrls, ...(await Promise.all(uploadPromises))]
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/listings/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ ...values, images: imageUrls, price: Math.round(values.price * 100) }),
            })
            if (!response.ok) throw new Error("Failed to update listing")
            navigate(`/listings/${id}`)
        } catch (error) {
            console.error(error)
            alert("Error updating listing")
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
        )
    }

    const busy = isSubmitting || uploading
    const totalImages = existingImages.length + selectedImages.length

    return (
        <div className="mx-auto max-w-2xl px-6 md:px-10 pt-10 pb-16">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 mb-6 bg-transparent border-none p-0 cursor-pointer text-sm text-foreground hover:text-muted-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <h1 className="text-[28px] font-bold text-foreground mb-2">Edit listing</h1>
            <p className="text-base text-muted-foreground mb-8">
                Update your listing details below.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5 leading-tight">Title</label>
                    <input
                        id="title"
                        placeholder="Vintage lamp, old bike…"
                        className="form-field h-14"
                        {...register("title")}
                    />
                    {errors.title && <p className="text-[13px] text-destructive mt-1">{errors.title.message}</p>}
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5 leading-tight">Description</label>
                    <textarea
                        id="description"
                        placeholder="Great condition, barely used…"
                        rows={4}
                        className="form-field resize-y py-3.5 px-3"
                        {...register("description")}
                    />
                    {errors.description && <p className="text-[13px] text-destructive mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1.5 leading-tight">Price (£)</label>
                        <input
                            type="number"
                            step="0.01"
                            id="price"
                            placeholder="0.00"
                            className="form-field h-14"
                            {...register("price")}
                        />
                        {errors.price && <p className="text-[13px] text-destructive mt-1">{errors.price.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1.5 leading-tight">Category</label>
                        <input
                            id="category"
                            placeholder="Furniture, electronics…"
                            className="form-field h-14"
                            {...register("category")}
                        />
                        {errors.category && <p className="text-[13px] text-destructive mt-1">{errors.category.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 leading-tight">Photos ({totalImages}/10)</label>

                    {existingImages.length > 0 && (
                        <div className="mb-3">
                            <p className="text-[13px] text-muted-foreground mb-2">Current photos</p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {existingImages.map((src, index) => (
                                    <div
                                        key={`existing-${index}`}
                                        className="relative aspect-square overflow-hidden rounded-button border border-hairline-soft"
                                    >
                                        <img src={src} alt={`Existing ${index}`} className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute top-1 right-1 flex items-center justify-center h-[22px] w-[22px] rounded-full bg-black/60 border-none cursor-pointer"
                                        >
                                            <X className="h-3 w-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <label
                        className={`flex flex-col items-center justify-center cursor-pointer transition-colors border-[1.5px] border-dashed border-border rounded-button p-6 hover:border-muted-soft ${totalImages >= 10 ? "bg-muted" : "bg-background"}`}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={onSelectImages}
                            disabled={totalImages >= 10}
                        />
                        <p className="text-sm text-muted-foreground text-center">
                            {totalImages >= 10 ? "Maximum 10 photos reached" : "Click to add more photos"}
                        </p>
                    </label>

                    {previews.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                            {previews.map((src, index) => (
                                <div
                                    key={`new-${index}`}
                                    className="relative aspect-square overflow-hidden rounded-button border border-hairline-soft"
                                >
                                    <img src={src} alt={`New ${index}`} className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeSelectedImage(index)}
                                        className="absolute top-1 right-1 flex items-center justify-center h-[22px] w-[22px] rounded-full bg-black/60 border-none cursor-pointer"
                                    >
                                        <X className="h-3 w-3 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={busy}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-rausch-active disabled:bg-rausch-disabled text-primary-foreground rounded-button h-12 px-6 text-base font-medium border-none cursor-pointer disabled:cursor-not-allowed leading-tight transition-colors"
                >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    Update Listing
                </button>
            </form>
        </div>
    )
}
