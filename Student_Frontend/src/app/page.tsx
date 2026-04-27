import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Categories } from "@/components/Categories";
import { Courses } from "@/components/Courses";
import { Instructors } from "@/components/Instructors";
import { Features } from "@/components/Features";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Stats />
      <Categories />
      <Instructors />
      <Courses />
      <Features />
      <CTA />
      <Footer />
    </main>
  );
}
