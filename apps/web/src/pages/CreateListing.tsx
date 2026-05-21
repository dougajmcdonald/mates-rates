import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { useNavigate } from "react-router-dom"
import { Loader2, X } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number().min(0, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
})

const fieldStyle: React.CSSProperties = {
  width: "100%",
  height: 56,
  backgroundColor: "#ffffff",
  border: "1px solid #dddddd",
  borderRadius: 8,
  padding: "0 12px",
  fontSize: 16,
  color: "#222222",
  outline: "none",
  boxSizing: "border-box",
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 500,
  color: "#222222",
  marginBottom: 6,
  lineHeight: 1.29,
}

const errorStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#c13515",
  marginTop: 4,
}

export default function CreateListing() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    return () => { previews.forEach((url) => URL.revokeObjectURL(url)) }
  }, [previews])

  const onSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const filesArray = Array.from(e.target.files)
    if (selectedImages.length + filesArray.length > 10) {
      alert("You can only upload a maximum of 10 images.")
      return
    }
    setSelectedImages((prev) => [...prev, ...filesArray])
    setPreviews((prev) => [...prev, ...filesArray.map((f) => URL.createObjectURL(f))])
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setUploading(true)
      const uploadPromises = selectedImages.map(async (file) => {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from("listings").upload(fileName, file)
        if (uploadError) throw uploadError
        return supabase.storage.from("listings").getPublicUrl(fileName).data.publicUrl
      })
      const imageUrls = await Promise.all(uploadPromises)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ ...values, images: imageUrls, price: Math.round(values.price * 100) }),
      })
      if (!response.ok) throw new Error("Failed to create listing")
      navigate("/dashboard")
    } catch (error) {
      console.error(error)
      alert("Error creating listing")
    } finally {
      setUploading(false)
    }
  }

  const busy = isSubmitting || uploading

  return (
    <div className="mx-auto max-w-2xl px-6 md:px-10" style={{ paddingTop: 40, paddingBottom: 64 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#222222", marginBottom: 8 }}>Sell an item</h1>
      <p style={{ fontSize: 16, color: "#6a6a6a", marginBottom: 32 }}>
        List something for your mates at mates rates.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        <div>
          <label htmlFor="title" style={labelStyle}>Title</label>
          <input
            id="title"
            placeholder="Vintage lamp, old bike…"
            style={fieldStyle}
            onFocus={(e) => (e.currentTarget.style.border = "2px solid #222222")}
            onBlur={(e) => (e.currentTarget.style.border = "1px solid #dddddd")}
            {...register("title")}
          />
          {errors.title && <p style={errorStyle}>{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" style={labelStyle}>Description</label>
          <textarea
            id="description"
            placeholder="Great condition, barely used…"
            rows={4}
            style={{
              ...fieldStyle,
              height: "auto",
              padding: "14px 12px",
              resize: "vertical",
              fontFamily: "inherit",
            }}
            onFocus={(e) => (e.currentTarget.style.border = "2px solid #222222")}
            onBlur={(e) => (e.currentTarget.style.border = "1px solid #dddddd")}
            {...register("description")}
          />
          {errors.description && <p style={errorStyle}>{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" style={labelStyle}>Price (£)</label>
            <input
              type="number"
              step="0.01"
              id="price"
              placeholder="0.00"
              style={fieldStyle}
              onFocus={(e) => (e.currentTarget.style.border = "2px solid #222222")}
              onBlur={(e) => (e.currentTarget.style.border = "1px solid #dddddd")}
              {...register("price")}
            />
            {errors.price && <p style={errorStyle}>{errors.price.message}</p>}
          </div>
          <div>
            <label htmlFor="category" style={labelStyle}>Category</label>
            <input
              id="category"
              placeholder="Furniture, electronics…"
              style={fieldStyle}
              onFocus={(e) => (e.currentTarget.style.border = "2px solid #222222")}
              onBlur={(e) => (e.currentTarget.style.border = "1px solid #dddddd")}
              {...register("category")}
            />
            {errors.category && <p style={errorStyle}>{errors.category.message}</p>}
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label style={labelStyle}>Photos ({selectedImages.length}/10)</label>
          <label
            className="flex flex-col items-center justify-center cursor-pointer transition-colors"
            style={{
              border: "1.5px dashed #dddddd",
              borderRadius: 8,
              padding: "24px",
              backgroundColor: selectedImages.length >= 10 ? "#f7f7f7" : "#ffffff",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#929292")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#dddddd")}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={onSelectImages}
              disabled={selectedImages.length >= 10}
            />
            <p style={{ fontSize: 14, color: "#6a6a6a", textAlign: "center" }}>
              {selectedImages.length >= 10
                ? "Maximum 10 photos reached"
                : "Click to add photos"}
            </p>
            <p style={{ fontSize: 13, color: "#929292", marginTop: 4 }}>
              JPEG, PNG, WebP — up to 10 photos
            </p>
          </label>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
              {previews.map((src, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden"
                  style={{ borderRadius: 8, border: "1px solid #ebebeb" }}
                >
                  <img src={src} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 flex items-center justify-center transition-colors"
                    style={{
                      width: 22, height: 22, borderRadius: "50%",
                      backgroundColor: "rgba(0,0,0,0.6)",
                      border: "none", cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.85)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.6)")}
                  >
                    <X className="h-3 w-3" style={{ color: "#ffffff" }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-2 transition-colors"
          style={{
            backgroundColor: busy ? "#ffd1da" : "#ff385c",
            color: "#ffffff",
            borderRadius: 8,
            padding: "14px 24px",
            height: 48,
            fontSize: 16,
            fontWeight: 500,
            border: "none",
            cursor: busy ? "not-allowed" : "pointer",
            lineHeight: 1.25,
          }}
          onMouseEnter={(e) => { if (!busy) e.currentTarget.style.backgroundColor = "#e00b41" }}
          onMouseLeave={(e) => { if (!busy) e.currentTarget.style.backgroundColor = "#ff385c" }}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          List Item
        </button>
      </form>
    </div>
  )
}
