import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { BlurText } from "@/components/ui/BlurText";
import MagicBento from "@/components/ui/MagicBento";
import LightPillar from "@/components/ui/LightPillar";
import DotGrid from "@/components/ui/DotGrid";
import { ArrowRight, Code, Terminal, Bot, Cpu, CircuitBoard, ArrowDown } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-neutral-950 text-neutral-200 selection:bg-neutral-800 selection:text-white relative">
      <NavBar />

      <section id="home" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <LightPillar
            topColor="#5227FF"
            bottomColor="#FF9FFC"
            intensity={0.6}
            rotationSpeed={0.3}
            glowAmount={0.005}
            pillarWidth={3.0}
            pillarHeight={0.4}
            noiseIntensity={0.5}
            pillarRotation={0}
            interactive={false}
            mixBlendMode="normal"
          />
        </div>

        <div className="relative z-10 max-w-4xl space-y-8 mx-auto">
          <BlurText
            text="Anirudh Ramesh"
            className="text-4xl font-bold tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl text-white justify-center"
            delay={0.1}
          />
          <BlurText
            text="Embedded Systems & IoT Engineer"
            className="text-2xl font-medium tracking-tight sm:text-4xl md:text-5xl text-white/80 drop-shadow-lg justify-center"
            delay={0.2}
          />
          <p className="mx-auto max-w-xl text-lg text-white/60 md:text-xl leading-relaxed drop-shadow-md">
            Building practical hardware systems with microcontrollers, sensors, and real-time automation. Passionate about embedded design, IoT systems, and creating impactful engineering projects.
          </p>
          <div className="flex justify-center gap-4">
            <a href="#projects" className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200">
              View Projects <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#contact" className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900">
              Contact Me
            </a>
          </div>
        </div>
      </section>

      <div className="relative w-full">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <DotGrid
            dotSize={2}
            gap={24}
            baseColor="#262626"
            activeColor="#525252"
            proximity={100}
            shockRadius={200}
            shockStrength={2}
            resistance={750}
            returnDuration={1.5}
            className="h-full w-full"
          />
        </div>

        <div className="relative z-10 pointer-events-none [&>*]:pointer-events-auto">
          <section id="about" className="py-24 md:py-32 px-6">
            <div className="mx-auto max-w-5xl space-y-12">
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">About Me</h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6 text-lg text-neutral-400 leading-relaxed">
                  <p>
                    I’m a 3rd-year Electronics and Computer Engineering student at VIT Chennai, passionate about embedded systems, IoT, and hands-on hardware development.
                  </p>
                  <p>
                    I love working with microcontrollers, sensors, and real-time decision systems, and I enjoy turning ideas into functional prototypes.
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-neutral-900/50 backdrop-blur-sm p-3 border border-neutral-800"><Cpu className="text-white" /></div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Embedded Systems</h3>
                      <p className="text-neutral-500">8051, ESP32, peripherals and sensor integration.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-neutral-900/50 backdrop-blur-sm p-3 border border-neutral-800"><Bot className="text-white" /></div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">IoT & Automation</h3>
                      <p className="text-neutral-500">Real-time control systems, wireless communication, automation logic, ESP-based web servers.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-neutral-900/50 backdrop-blur-sm p-3 border border-neutral-800"><CircuitBoard className="text-white" /></div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">VLSI & Circuit Design</h3>
                      <p className="text-neutral-500">Analog design, FinFET-based circuits, Cadence Virtuoso, DAC/Op-Amp design.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="projects" className="py-24 md:py-32 px-6">
            <div className="mx-auto max-w-6xl space-y-16">
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl text-center">My Projects</h2>
              <div className="w-full">
                <MagicBento
                  items={[
                    {
                      id: 1,
                      title: '8-Bit R-2R DAC using FinFET',
                      description: 'Designed and simulated an energy-efficient 8-bit R-2R DAC entirely using 18nm FinFET devices. Integrated a two-stage FinFET op-amp to ensure stable, linear analog output. Achieved low power consumption and compact layout using Cadence Virtuoso.',
                      tags: ['FinFET', 'Op-Amp', 'Cadence Virtuoso'],
                      color: 'rgba(23, 23, 23, 0.8)'
                    },
                    {
                      id: 2,
                      title: 'CineRate',
                      description: 'Built a full-stack movie review website where users can rate films, add favorites, contribute new movies, and sign in with Google Authentication. Developed the UI with Next.js and Tailwind, and managed authentication + database using Supabase.',
                      tags: ['Next.js', 'Supabase', 'Tailwind'],
                      color: 'rgba(23, 23, 23, 0.8)'
                    },
                    {
                      id: 3,
                      title: 'IoT-Based Home Automation System',
                      description: 'Developed an ESP32-based smart home controller that automates lights and fans using real-time sensor data. Supports Auto and Manual modes via a web interface hosted on the ESP32. Integrated DHT11, LDR, IR, ultrasonic sensors, and relay control.',
                      tags: ['ESP32', 'Embedded C', 'IoT'],
                      color: 'rgba(23, 23, 23, 0.8)'
                    },
                    {
                      id: 4,
                      title: 'Motion & Time-Based Streetlight Controller',
                      description: 'Created a smart streetlight system using the 8051 microcontroller with RTC-based scheduling and motion-activated brightness control. Implemented PWM dimming to optimize energy use during low-traffic hours.',
                      tags: ['8051', 'Embedded C', 'Sensors'],
                      color: 'rgba(23, 23, 23, 0.8)'
                    }
                  ]}
                  spotlightRadius={150}
                  glowColor="255, 255, 255"
                  enableTilt={true}
                  textAutoHide={false}
                />
              </div>
            </div>
          </section>

          <section id="contact" className="py-24 md:py-32 px-6">
            <div className="mx-auto max-w-3xl text-center space-y-8">
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">Let&apos;s Connect</h2>
              <p className="text-lg text-neutral-400">
                Whether it’s embedded systems, IoT projects, or engineering ideas -
                I’d love to collaborate and explore new opportunities.
              </p>
              <a href="https://www.linkedin.com/in/anirudh-ramesh-407445206/" target="_blank" rel="noopener noreferrer" className="inline-block rounded-full bg-white px-8 py-4 text-lg font-bold text-black transition hover:bg-neutral-200">
                Connect on LinkedIn
              </a>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
