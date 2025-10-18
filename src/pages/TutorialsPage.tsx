import { useEffect, useState } from "react"
import { Navbar } from "@/components/Navbar"

interface Video {
  id: string
  title: string
  url?: string
}

export default function TutorialsPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/videos.json")
        if (!response.ok) throw new Error("Failed to load videos.")
        const data = await response.json()
        setVideos(data.videos || [])
      } catch (err) {
        console.error("Error loading videos.json:", err)
        setError("Unable to load videos. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto px-4 py-10 md:py-16">
        {/* Header Section */}
        <header className="mb-8 text-center animate-in fade-in duration-500">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            My Tutorials
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Explore my latest YouTube tutorials and learning content.
          </p>
        </header>

        {/* Content Section */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground text-lg">
            Loading tutorials...
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-medium">
            {error}
          </div>
        ) : videos.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {videos.map((video, index) => (
              <article
                key={video.id}
                className="group flex flex-col gap-4 transition-all duration-300 animate-in fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Video Frame */}
                <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-[1.03] group-hover:shadow-xl">
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${video.id}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Video Title */}
                <h3 className="text-lg font-semibold leading-snug group-hover:text-accent transition-colors duration-300 line-clamp-2">
                  {video.title}
                </h3>
              </article>
            ))}
          </section>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No tutorials available yet.</p>
            <p className="text-sm mt-2">
              Add videos to <code className="font-mono text-sm bg-muted px-1 rounded">public/videos.json</code> to display them here.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
