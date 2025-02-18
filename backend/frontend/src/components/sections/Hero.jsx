// components/sections/Hero.jsx
import { Button } from "@/components/ui/button";
import ImpactChart from "../shared/ImpactChart";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
      <div className="container py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Redefine Your Style,<br />
              <span className="text-emerald-400">Sustainably</span>
            </h1>

            <p className="text-base md:text-lg text-gray-300 max-w-lg">
              Join our community of conscious fashionistas making sustainable choices. Browse curated pre-loved fashion and give garments a second life.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg transition-shadow duration-300 px-6 md:px-8 py-2.5 md:py-3 rounded-full text-sm md:text-base w-full sm:w-auto"
              >
                Shop Now
              </Button>
              <Button
                variant="outline"
                className="border-2 text-emerald-500 transition-colors duration-300 px-6 md:px-8 py-2.5 md:py-3 rounded-full text-sm md:text-base w-full sm:w-auto"
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className="hidden lg:block">
            <ImpactChart />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;