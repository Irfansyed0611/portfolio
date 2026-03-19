import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";

export default function App() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-4 md:p-8">
      <Card className="w-full max-w-6xl h-auto md:h-[500px] bg-black/[0.96] relative overflow-hidden border-neutral-800">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />

        <div className="flex flex-col md:flex-row h-full">
          {/* Left content */}
          <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
            <p className="text-lg text-neutral-400 mb-2">Hi, my name is</p>
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              Syed Irfan.
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-neutral-300 mt-2">
              I build things in the cloud.
            </h2>
            <p className="mt-6 text-neutral-400 max-w-lg leading-relaxed">
              I'm a certified AWS Solutions Architect with expertise in designing 
              and implementing secure, scalable, and cost-optimized cloud 
              infrastructures. Currently working on DevOps projects, leveraging 
              tools like Terraform, Docker, and CI/CD pipelines to automate and 
              streamline cloud operations at Stratogent.
            </p>
          </div>

          {/* Right content - 3D Scene */}
          <div className="flex-1 relative h-[300px] md:h-auto">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
