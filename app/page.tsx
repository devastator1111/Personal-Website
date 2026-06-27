"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { BlurText } from "@/components/ui/BlurText";
import MagicBento from "@/components/ui/MagicBento";
import SoftBackdrop from "@/components/ui/SoftBackdrop";
import DotGrid from "@/components/ui/DotGrid";
import { ArrowDown, ArrowUpRight, Bot, Cpu, CircuitBoard } from "lucide-react";
import { ProjectModal, type ProjectData } from "@/components/ui/ProjectModal";

// 3D physics canvas — load only on the client to avoid SSR issues.
const Lanyard = dynamic(() => import("@/components/ui/Lanyard"), { ssr: false });

// Tracks whether the dark theme is active so canvas-based effects can recolor.
function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

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
    color: 'var(--card)',
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
    color: 'var(--card)',
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
    color: 'var(--card)',
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
    color: 'var(--card)',
    images: ["/projects/St.Light/Ckt.jpeg", "/projects/St.Light/Ckt Diagram.jpeg"]
  }
];

function SectionHeading({ index, total, title }: { index: string; total: string; title: string }) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-border pb-5">
      <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-6xl">{title}</h2>
      <span className="eyebrow whitespace-nowrap pb-1.5">{index} / {total}</span>
    </div>
  );
}

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDark = useIsDark();
  const heroRef = useRef<HTMLElement>(null);

  const handleProjectClick = (project: ProjectData) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground relative">
      <NavBar />

      {/* ---------------- HERO ---------------- */}
      <section ref={heroRef} id="home" className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pt-28 pb-20">
        <SoftBackdrop className="absolute inset-0 w-full h-full" />

        {/* draggable lanyard — confined to the hero, grab it anywhere in this section (desktop only) */}
        <div className="hidden md:block">
          <Lanyard position={[0, 0, 18]} gravity={[0, -40, 0]} fov={22} lanyardWidth={0.8} eventSource={heroRef} isDark={isDark} />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-end gap-10 md:grid-cols-[1.5fr_1fr]">
          {/* left: intro */}
          <div>
            <p className="eyebrow mb-6">Embedded Systems &amp; IoT Engineer</p>

            <BlurText
              text="Anirudh Ramesh"
              className="font-display text-[3.2rem] font-semibold leading-[0.92] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[7rem]"
              delay={0.08}
            />

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              I build practical hardware systems with microcontrollers, sensors, and real-time
              automation. Passionate about embedded design, IoT systems, and creating impactful engineering projects.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#projects" className="group flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-95">
                View Projects <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </a>
              <a href="#contact" className="rounded-full border border-border bg-card/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition hover:bg-secondary">
                Contact Me
              </a>
            </div>
          </div>

          {/* right: meta box */}
          <dl className="space-y-px overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm">
            {[
              { k: "Location", v: "Bengaluru, India" },
              { k: "Studying", v: "ECM · VIT Chennai" },
              { k: "Focus", v: "Embedded Systems · IoT · Automation" },
              { k: "Status", v: "Open to opportunities" },
            ].map((row) => (
              <div key={row.k} className="flex items-center justify-between gap-4 px-5 py-3.5 odd:bg-secondary/30">
                <dt className="font-mono-label text-[0.7rem] uppercase tracking-wider text-muted-foreground">{row.k}</dt>
                <dd className="text-sm font-medium text-foreground text-right">{row.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------- BODY (with subtle dot grid) ---------------- */}
      <div className="relative w-full">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          <DotGrid
            dotSize={2}
            gap={28}
            baseColor={isDark ? "#372e45" : "#e0d6c6"}
            activeColor={isDark ? "#c5b2ec" : "#b8a2e6"}
            proximity={110}
            shockRadius={200}
            shockStrength={2}
            resistance={750}
            returnDuration={1.5}
            className="h-full w-full"
          />
        </div>

        <div className="relative z-10 pointer-events-none [&>*]:pointer-events-auto">
          {/* ---------------- ABOUT ---------------- */}
          <section id="about" className="py-24 md:py-32 px-6">
            <div className="mx-auto max-w-5xl space-y-12">
              <SectionHeading index="01" total="03" title="About" />
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p className="font-display text-2xl leading-snug text-foreground md:text-3xl">
                    An Electronics &amp; Computer Engineering student who likes making hardware
                    actually do things.
                  </p>
                  <p>
                    I&rsquo;m passionate about embedded systems, IoT, and hands-on hardware development. I love
                    working with microcontrollers, sensors, and real-time decision systems.
                  </p>
                  <p>
                    I enjoy turning ideas into functional prototypes, from analog circuit design to
                    automated, connected devices.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-ring">
                    <div className="rounded-xl bg-lilac p-3"><Cpu className="text-lilac-foreground" /></div>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-foreground">Embedded Systems</h3>
                      <p className="text-muted-foreground text-sm mt-1">8051, ESP32, peripherals and sensor integration.</p>
                    </div>
                  </div>
                  <div className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-ring">
                    <div className="rounded-xl bg-mint p-3"><Bot className="text-mint-foreground" /></div>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-foreground">IoT &amp; Automation</h3>
                      <p className="text-muted-foreground text-sm mt-1">Real-time control systems, wireless communication, automation logic, ESP-based web servers.</p>
                    </div>
                  </div>
                  <div className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-ring">
                    <div className="rounded-xl bg-pink p-3"><CircuitBoard className="text-pink-foreground" /></div>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-foreground">VLSI &amp; Circuit Design</h3>
                      <p className="text-muted-foreground text-sm mt-1">Analog design, FinFET-based circuits, Cadence Virtuoso, DAC/Op-Amp design.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- PROJECTS ---------------- */}
          <section id="projects" className="py-24 md:py-32 px-6">
            <div className="mx-auto max-w-6xl space-y-14">
              <div className="mx-auto max-w-5xl">
                <SectionHeading index="02" total="03" title="Selected Work" />
              </div>
              <div className="w-full">
                <MagicBento
                  items={PROJECTS.map((project, i) => ({
                    ...project,
                    label: String(i + 1).padStart(2, "0"),
                    headerContent: (
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    ),
                    onClick: () => handleProjectClick(project)
                  }))}
                  spotlightRadius={170}
                  glowColor="184, 162, 230"
                  enableStars={false}
                  enableTilt={false}
                  enableMagnetism={false}
                  enableSpotlight={!isDark}
                  enableBorderGlow={!isDark}
                  clickEffect={false}
                  textAutoHide={false}
                />
              </div>
            </div>
          </section>

          {/* ---------------- CONTACT ---------------- */}
          <section id="contact" className="py-24 md:py-32 px-6">
            <div className="mx-auto max-w-5xl">
              <SectionHeading index="03" total="03" title="Let's Connect" />
              <div className="mt-12 grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
                <p className="font-display text-3xl leading-snug text-foreground md:text-4xl">
                  Whether it&rsquo;s embedded systems, IoT projects, or engineering ideas, I&rsquo;d love
                  to collaborate and explore new opportunities.
                </p>
                <div className="flex flex-col gap-4">
                  <a href="https://www.linkedin.com/in/anirudh-ramesh-407445206/" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "#0A66C2" }} className="group flex items-center justify-between rounded-2xl px-6 py-4 text-base font-semibold text-white transition hover:brightness-110">
                    Connect on LinkedIn <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                  <a href="mailto:rameshanirudh11@gmail.com" className="group flex items-center justify-between rounded-2xl border border-border bg-card px-6 py-4 text-base font-semibold text-foreground transition hover:bg-secondary">
                    Send an Email <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>
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
