import { SplineScene } from "@/components/ui/splite"
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"

function SplineSceneBasic() {
  return (
    <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      {/* Spline scene fills the entire card */}
      <div className="absolute inset-0">
        <SplineScene 
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      {/* Text content floats on top, pointer-events-none lets mouse pass through to Spline */}
      <div className="relative z-10 flex h-full pointer-events-none">
        <div className="flex-1 p-8 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 pointer-events-auto">
            Interactive 3D
          </h1>
          <p className="mt-4 text-neutral-300 max-w-lg pointer-events-auto">
            Bring your UI to life with beautiful 3D scenes. Create immersive experiences 
            that capture attention and enhance your design.
          </p>
        </div>

        {/* Empty spacer so text stays on the left half */}
        <div className="flex-1" />
      </div>
    </Card>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl">
        <SplineSceneBasic />
      </div>
    </div>
  )
}
