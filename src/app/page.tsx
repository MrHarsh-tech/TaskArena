import Link from "next/link";
import {
  Trophy,
  BookOpen,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle2,
  Users,
  Target,
  Sparkles,
  Brain,
  Gamepad2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="animate-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/80 via-white/50 to-accent-50/60 dark:from-surface-950 dark:via-surface-900 dark:to-brand-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.10),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
              <Sparkles className="h-4 w-4" />
              Now in Beta — Start learning today
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Learn, Compete, and{" "}
              <span className="text-gradient">Master Skills</span>{" "}
              Through Challenges
            </h1>

            <p className="mt-6 text-lg text-surface-600 dark:text-surface-400 sm:text-xl">
              TaskArena is where instructors craft engaging MCQ challenges and
              students sharpen their knowledge — with instant feedback,
              leaderboards, and progress tracking.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register" className="btn-primary text-base px-8 py-3">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/challenges"
                className="btn-secondary text-base px-8 py-3"
              >
                Browse Challenges
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-surface-500">
              <div className="flex items-center gap-2">
                <div className="icon-wrapper h-8 w-8 icon-brand">
                  <Users className="h-4 w-4" />
                </div>
                <span className="font-semibold">500+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="icon-wrapper h-8 w-8 icon-electric">
                  <Target className="h-4 w-4" />
                </div>
                <span className="font-semibold">200+ Challenges</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="icon-wrapper h-8 w-8 icon-gold">
                  <Trophy className="h-4 w-4" />
                </div>
                <span className="font-semibold">50+ Instructors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-surface-200 bg-white py-20 dark:border-surface-800 dark:bg-surface-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to{" "}
              <span className="text-gradient">level up</span>
            </h2>
            <p className="mt-4 text-surface-600 dark:text-surface-400">
              Whether you&apos;re teaching or learning, TaskArena gives you the
              tools to succeed.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card group cursor-default"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`mb-4 icon-wrapper h-12 w-12 ${feature.iconClass}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-surface-600 dark:text-surface-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-surface-200 bg-surface-50 py-20 dark:border-surface-800 dark:bg-surface-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white shadow-lg"
                  style={{
                    background: stepGradients[i],
                    boxShadow: `0 8px 24px ${stepShadows[i]}`,
                  }}
                >
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-surface-600 dark:text-surface-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-surface-200 dark:border-surface-800">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="glass-card mx-auto max-w-3xl text-center p-12" style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6 50%, #ec4899)' }}>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to start learning?
            </h2>
            <p className="mt-4 text-white/80">
              Join TaskArena today and start your journey toward mastery.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="btn bg-white text-brand-700 hover:bg-brand-50 shadow-xl text-base px-8 py-3"
              >
                Create Account
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const stepGradients = [
  'linear-gradient(135deg, #06b6d4, #0891b2)',
  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  'linear-gradient(135deg, #ec4899, #db2777)',
];

const stepShadows = [
  'rgba(6,182,212,0.3)',
  'rgba(139,92,246,0.3)',
  'rgba(236,72,153,0.3)',
];

const features = [
  {
    icon: BookOpen,
    iconClass: "icon-brand",
    title: "MCQ & Fill-in-the-Blanks",
    description:
      "Create diverse challenges with multiple choice and fill-in-the-blank questions. Mixed modes in a single challenge.",
  },
  {
    icon: Zap,
    iconClass: "icon-gold",
    title: "XP & Leveling System",
    description:
      "Earn experience points with every attempt. Level up, unlock achievements, and showcase your progress.",
  },
  {
    icon: BarChart3,
    iconClass: "icon-electric",
    title: "Detailed Analytics",
    description:
      "Students get score trends, category radar, and activity heatmaps. Instructors see question difficulty analysis.",
  },
  {
    icon: Trophy,
    iconClass: "icon-coral",
    title: "Leaderboards",
    description:
      "Compete with peers on per-challenge and global leaderboards. Level badges show your standing.",
  },
  {
    icon: Brain,
    iconClass: "icon-accent",
    title: "Instructor Dashboard",
    description:
      "Score distributions, completion funnels, hardest questions, and fill-in-blank answer analysis.",
  },
  {
    icon: Gamepad2,
    iconClass: "icon-success",
    title: "Role-Based Access",
    description:
      "Students, instructors, and admins each get tailored dashboards and capabilities.",
  },
];

const steps = [
  {
    title: "Sign Up",
    description: "Create your free account and choose your role — student or instructor.",
  },
  {
    title: "Engage",
    description: "Browse challenges, answer MCQs and fill-in-the-blanks, or create your own.",
  },
  {
    title: "Grow",
    description: "Earn XP, unlock achievements, track analytics, and climb leaderboards.",
  },
];
