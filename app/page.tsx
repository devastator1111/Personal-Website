"use client";

import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { BlurText } from "@/components/ui/BlurText";
import MagicBento from "@/components/ui/MagicBento";
import LightPillar from "@/components/ui/LightPillar";
import DotGrid from "@/components/ui/DotGrid";
import { ArrowRight, Code, Terminal, Bot, Cpu, CircuitBoard, ArrowDown } from "lucide-react";
import { ProjectModal, type ProjectData } from "@/components/ui/ProjectModal";

const PROJECTS = [
  {
    id: 1,
    title: '8-Bit R-2R DAC Using 18nm FinFET Technology',
    description: 'Designed and simulated an 8-bit R-2R Digital-to-Analog Converter using 18nm FinFET technology. Focused on high linearity, low leakage, and stable analog output using a custom two-stage FinFET op-amp.',
    longDescription: `This project involved designing and simulating an 8-bit R-2R Digital-to-Analog Converter using 18nm FinFET technology. The goal was to build a DAC that gives stable and accurate analog output while keeping power consumption low.

I designed the entire architecture using FinFET devices and created a two-stage FinFET operational amplifier to support the ladder network. All simulations and layout work were done in Cadence Virtuoso, where I focused on improving linearity, reducing leakage, and keeping the layout compact. The design performed well in simulation, showing clean stepwise output and consistent behavior at higher frequencies.

Key Outcomes
• Average power consumption of 3.21 mW at 10 MHz
• Verified high linearity and stable output response
• Designed a compact, low leakage layout using FinFET devices
• Completed schematic, simulation, and layout in Cadence Virtuoso

Tools and Skills
Cadence Virtuoso, FinFET technology, analog design, op-amp design, R-2R ladder architecture`,
    tags: ['Cadence Virtuoso', 'FinFET', 'Analog Design'],
    color: 'rgba(23, 23, 23, 0.8)',
    images: ["/projects/R-2R DAC/DAC Ckt.jpeg", "/projects/R-2R DAC/DAC Symbol.jpeg", "/projects/R-2R DAC/Graph.jpeg", "/projects/R-2R DAC/OpAmp Ckt.jpeg"]
  },
  {
    id: 2,
    title: 'CineRate: Movie Review Platform',
    description: 'A full-stack movie review website allowing users to rate films, add favorites, and sign in with Google. Built with Next.js, Tailwind CSS, and Supabase for backend and authentication.',
    longDescription: `CineRate is a movie review website that I built to learn full-stack development. The platform allows users to rate and review movies, add them to favorites or wishlists, and even contribute missing movie entries. I used Next.js for the frontend and Supabase for the backend and authentication, which includes Google sign-in.

Working on CineRate helped me understand how to structure a database, design a clean UI, and deploy a fully functional app. It gave me hands-on experience with user authentication, API handling, and managing real-time data.

Key Features
• User reviews and ratings
• Add movies to favorites and wishlists
• Contribute missing movies
• Google authentication with Supabase
• Responsive and minimal UI

Tech Stack
Next.js, Tailwind CSS, Supabase, Vercel`,
    tags: ['Next.js', 'Supabase', 'Tailwind CSS'],
    color: 'rgba(23, 23, 23, 0.8)',
    images: ["/projects/Cinerate/Home Page.jpeg", "/projects/Cinerate/Movie Page.jpeg", "/projects/Cinerate/Login_signup page.jpeg", "/projects/Cinerate/Adding Movies.jpeg", "/projects/Cinerate/Favourite Page.jpeg", "/projects/Cinerate/Wishlist Page.jpeg"]
  },
  {
    id: 3,
    title: 'IoT-Based Home Automation System Using ESP32',
    description: 'An ESP32-based simple home automation system controlling lights and fans via real-time sensors (DHT11, LDR, IR). Features Auto and Manual modes with a hosted web interface.',
    longDescription: `This project was part of my Embedded Systems internship at Maven Silicon. I built a simple home automation system using the ESP32, where lights and fans are controlled based on real-time sensor readings. The system uses sensors like DHT11, LDR, IR, and an ultrasonic sensor to monitor the environment, and relays to operate the appliances.

There are two modes. In Auto mode, the ESP32 adjusts the devices automatically based on conditions like temperature and motion. In Manual mode, the user can control everything from a web page hosted on the ESP32 itself. This project helped me understand decision-making logic, IoT communication, and writing efficient firmware.

Key Features
• Temperature-based fan control
• Motion-triggered lighting
• Web interface for manual control
• Real-time sensor integration
• Energy-saving automation logic

Skills Used
Embedded C, ESP32, sensor interfacing, web server hosting, automation logic`,
    tags: ['Embedded C', 'ESP32', 'IoT'],
    color: 'rgba(23, 23, 23, 0.8)',
    images: ["/projects/IoT/Ckt.jpeg", "/projects/IoT/Flow Chart.jpeg"]
  },
  {
    id: 4,
    title: 'Motion and Time-Based Streetlight Controller Using 8051',
    description: 'Smart streetlight system using 8051 and RTC for time-scheduling and motion detection. Implements PWM dimming to save power during low-traffic hours.',
    longDescription: `This project focuses on improving streetlight efficiency using an 8051 microcontroller. The system tracks time using an RTC module to decide when lights should be on or off. During midnight to early morning hours, the lights stay dim to save power and brighten only when the PIR sensor detects movement. I implemented PWM for dimming control and wrote the firmware in Embedded C.
    
Check out the demo video: https://www.youtube.com/watch?v=5ucZLeoO1QQ

The idea was to keep the system simple but effective. It combines time-based scheduling with motion detection, which significantly reduces power usage while still keeping the area illuminated when needed.

Key Features
• Time-based control using RTC
• Motion-based brightness boost
• PWM dimming
• Low-cost hardware setup
• Improves power efficiency

Technologies
8051 microcontroller, Embedded C, RTC DS1307, PIR sensor, PWM, Keil uVision`,
    tags: ['8051', 'Embedded C', 'Sensors'],
    color: 'rgba(23, 23, 23, 0.8)',
    images: ["/projects/St.Light/Ckt.jpeg", "/projects/St.Light/Ckt Diagram.jpeg"]
  }
];

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

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
                  items={PROJECTS.map(project => ({
                    ...project,
                    onClick: () => handleProjectClick(project)
                  }))}
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
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={selectedProject}
      />
    </main>
  );
}
