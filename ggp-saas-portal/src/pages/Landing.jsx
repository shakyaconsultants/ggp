import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "👥",
    title: "Client onboarding",
    desc: "Add clients with email and a generated app password. Share credentials instantly — they log in and complete their health profile in the mobile app.",
  },
  {
    icon: "📋",
    title: "Diet plan builder",
    desc: "Create personalized diet plans with start/end dates, meal schedules, and notes. Assign plans per client from your dashboard.",
  },
  {
    icon: "📝",
    title: "Reusable templates",
    desc: "Save time with diet and food templates. Build once, apply to multiple clients and iterate as your practice grows.",
  },
  {
    icon: "🥗",
    title: "Food catalog",
    desc: "Maintain your own food library with macros, meal types, and vegetarian tags — the foundation for accurate meal planning.",
  },
  {
    icon: "📅",
    title: "Consultation slots",
    desc: "Set your availability by date and time slot. Clients book calls through the mobile app against your schedule.",
  },
  {
    icon: "📱",
    title: "Mobile app delivery",
    desc: "Clients use the Good Gut mobile app for meals, daily tracking, and consultations — automatically linked to your practice.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign up as a nutritionist in minutes. Add your specialty, practice name, and professional details.",
  },
  {
    step: "02",
    title: "Configure your practice",
    desc: "Set up food items, templates, diet plans, and consultation slots tailored to how you work.",
  },
  {
    step: "03",
    title: "Register your clients",
    desc: "Create client login accounts linked to your practice. Clients complete their own profile inside the Good Gut app.",
  },
  {
    step: "04",
    title: "Deliver through the app",
    desc: "Clients log into the Good Gut app, follow your plans, track progress, and book sessions with you.",
  },
];

const STATS = [
  { value: "100%", label: "Client data ownership" },
  { value: "1", label: "Unified dashboard" },
  { value: "24/7", label: "App access for clients" },
  { value: "0", label: "Code required to start" },
];

const PLANS = [
  {
    name: "Free trial",
    price: "₹1,000",
    period: "value · 15 days free",
    desc: "Start your practice immediately. Full dashboard and client app access during trial.",
    features: [
      "15-day free trial after signup",
      "Nutritionist dashboard access",
      "Unlimited client registration",
      "Diet & food templates",
      "Client mobile app delivery",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Annual plan",
    price: "₹1,000",
    period: "per year after trial",
    desc: "Keep your dashboard and client apps running after the trial ends.",
    features: [
      "1 year of full SaaS access",
      "Razorpay secure checkout",
      "Client app access restored on payment",
      "All dashboard features included",
      "Renew yearly to stay active",
    ],
    cta: "Create account",
    highlighted: false,
  },
];

const FAQ = [
  {
    q: "What is Good Gut Product?",
    a: "Good Gut Product is a SaaS platform for nutritionists and dieticians. You get a professional dashboard to manage clients, diet plans, and consultations — while clients interact through the Good Gut mobile app.",
  },
  {
    q: "Do my clients need to sign up themselves?",
    a: "You create their email and app password from your dashboard. They download the app, sign in, and complete their health profile themselves — the same flow already built into the Good Gut app.",
  },
  {
    q: "What can I manage from the dashboard?",
    a: "Clients, diet plans, diet templates, food templates, food catalog, consultation slots, and your professional profile — all in one place.",
  },
  {
    q: "Is the mobile app separate?",
    a: "Yes. Clients use the existing Good Gut mobile app (iOS & Android) for meal tracking, daily wellness, and booking calls. Your dashboard controls what they receive from your practice.",
  },
  {
    q: "How do I get started?",
    a: "Click 'Start free trial', complete nutritionist registration, and you'll land in your dashboard with a 15-day free trial (worth ₹1,000). After 15 days, pay ₹1,000/year via Razorpay to continue — your clients can use the app only while your subscription is active.",
  },
  {
    q: "What happens when my trial ends?",
    a: "Your dashboard pauses and your clients cannot log into the mobile app until you pay the annual ₹1,000 subscription. Once paid, both you and your clients get immediate access again for one year.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I moved my entire client base onto Good Gut Product in a weekend. Creating profiles and diet plans from one dashboard changed how I run my practice.",
    name: "Dr. Priya Sharma",
    role: "Clinical Nutritionist, Mumbai",
  },
  {
    quote:
      "My clients love the app for tracking meals. I love not chasing spreadsheets — templates and slot booking save me hours every week.",
    name: "James Okonkwo",
    role: "Sports Nutrition Coach, London",
  },
];

export default function Landing() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link to="/" className="brand">
          <span className="brand-mark">GG</span>
          <span className="brand-text">
            Good Gut <em>Product</em>
          </span>
        </Link>
        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#platform">Platform</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <Link to="/login" className="btn btn-ghost">
            Sign in
          </Link>
          <Link to="/register" className="btn btn-primary">
            Start free
          </Link>
        </nav>
        <Link to="/register" className="btn btn-primary mobile-cta">
          Start free
        </Link>
      </header>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-container lp-hero-grid">
          <div className="lp-hero-content">
            <div className="lp-badge">
              <span className="lp-badge-dot" />
              Nutritionist SaaS Platform
            </div>
            <h1>
              The complete platform to run your{" "}
              <span className="lp-gradient-text">nutrition practice</span>
            </h1>
            <p className="lp-hero-sub">
              Good Gut Product gives nutrition professionals a powerful dashboard to register
              clients, build diet plans, manage consultations, and deliver personalized care
              through the Good Gut mobile app — without building software from scratch.
            </p>
            <div className="lp-hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Start your practice — free
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Sign in to dashboard
              </Link>
            </div>
            <div className="lp-hero-trust">
              <span>✓ No credit card required</span>
              <span>✓ Instant dashboard access</span>
              <span>✓ iOS & Android app for clients</span>
            </div>
          </div>

          <div className="lp-hero-visual">
            <div className="lp-dashboard-mock">
              <div className="lp-mock-header">
                <div className="lp-mock-dots">
                  <span /><span /><span />
                </div>
                <span className="lp-mock-title">Good Gut Product — Dashboard</span>
              </div>
              <div className="lp-mock-body">
                <div className="lp-mock-sidebar">
                  <div className="lp-mock-nav active">Clients</div>
                  <div className="lp-mock-nav">Diet plans</div>
                  <div className="lp-mock-nav">Templates</div>
                  <div className="lp-mock-nav">Slots</div>
                  <div className="lp-mock-nav">Food catalog</div>
                  <div className="lp-mock-nav">Exercises</div>
                </div>
                <div className="lp-mock-main">
                  <div className="lp-mock-stat-row">
                    <div className="lp-mock-stat">
                      <span>Active clients</span>
                      <strong>24</strong>
                    </div>
                    <div className="lp-mock-stat">
                      <span>Plans this week</span>
                      <strong>8</strong>
                    </div>
                    <div className="lp-mock-stat">
                      <span>Calls booked</span>
                      <strong>5</strong>
                    </div>
                  </div>
                  <div className="lp-mock-table">
                    <div className="lp-mock-row head">
                      <span>Client</span>
                      <span>Goal</span>
                      <span>Status</span>
                    </div>
                    <div className="lp-mock-row">
                      <span>Sarah M.</span>
                      <span>Weight loss</span>
                      <span className="lp-pill active">Active</span>
                    </div>
                    <div className="lp-mock-row">
                      <span>Rahul K.</span>
                      <span>Muscle gain</span>
                      <span className="lp-pill active">Active</span>
                    </div>
                    <div className="lp-mock-row">
                      <span>Emma L.</span>
                      <span>Gut health</span>
                      <span className="lp-pill pending">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lp-float-card lp-float-1">
              <span>📱</span>
              <div>
                <strong>Client logged in</strong>
                <small>Meal plan synced</small>
              </div>
            </div>
            <div className="lp-float-card lp-float-2">
              <span>✅</span>
              <div>
                <strong>New client registered</strong>
                <small>Profile complete</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="lp-stats-bar">
        <div className="lp-container lp-stats-grid">
          {STATS.map((s) => (
            <div key={s.label} className="lp-stat-item">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">Everything you need</p>
            <h2>Built for modern nutrition practices</h2>
            <p>
              From client onboarding to diet delivery — Good Gut Product covers the full workflow
              so you can focus on what matters: your clients&apos; health.
            </p>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="lp-feature-card">
                <span className="lp-feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Platform split */}
      <section id="platform" className="lp-section lp-section-alt">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">Two sides, one ecosystem</p>
            <h2>Your dashboard. Their app.</h2>
          </div>
          <div className="lp-split-grid">
            <div className="lp-split-card">
              <div className="lp-split-label">For nutritionists</div>
              <h3>Professional web dashboard</h3>
              <ul>
                <li>Register & manage unlimited clients</li>
                <li>Create client email & generated app password</li>
                <li>Create & assign diet plans per client</li>
                <li>Build reusable diet & food templates</li>
                <li>Manage food catalog with macro data</li>
                <li>Set consultation availability slots</li>
                <li>Update your professional profile</li>
              </ul>
              <Link to="/register" className="btn btn-primary">
                Open your dashboard
              </Link>
            </div>
            <div className="lp-split-card lp-split-card-dark">
              <div className="lp-split-label">For your clients</div>
              <h3>Good Gut mobile app</h3>
              <ul>
                <li>Log in with credentials you provide</li>
                <li>Complete health profile in the app</li>
                <li>Automatically linked to your practice</li>
                <li>Track meals, macros & daily wellness</li>
                <li>Follow assigned diet plans</li>
                <li>Book consultation calls with you</li>
                <li>View health content & recommendations</li>
                <li>Available on iOS & Android</li>
              </ul>
              <span className="lp-app-badges">
                <span className="lp-store-badge">App Store</span>
                <span className="lp-store-badge">Google Play</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">Simple setup</p>
            <h2>Go live in four steps</h2>
          </div>
          <div className="lp-steps-grid">
            {STEPS.map((s) => (
              <article key={s.step} className="lp-step-card">
                <span className="lp-step-num">{s.step}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="lp-section lp-section-alt">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">Trusted by professionals</p>
            <h2>What nutritionists are saying</h2>
          </div>
          <div className="lp-testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="lp-testimonial">
                <p>&ldquo;{t.quote}&rdquo;</p>
                <footer>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">Transparent pricing</p>
            <h2>Start free, scale when you&apos;re ready</h2>
            <p>No hidden fees. Register today and begin managing clients immediately.</p>
          </div>
          <div className="lp-pricing-grid">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`lp-pricing-card${plan.highlighted ? " highlighted" : ""}`}
              >
                {plan.highlighted && <span className="lp-popular-badge">Most popular</span>}
                <h3>{plan.name}</h3>
                <div className="lp-price">
                  <strong>{plan.price}</strong>
                  <span>{plan.period}</span>
                </div>
                <p className="lp-plan-desc">{plan.desc}</p>
                <ul>
                  {plan.features.map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>
                <Link
                  to={plan.highlighted ? "/register" : "/register"}
                  className={`btn ${plan.highlighted ? "btn-primary btn-block" : "btn-outline btn-block"}`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="lp-section lp-section-alt">
        <div className="lp-container lp-faq-wrap">
          <div className="lp-section-head lp-section-head-left">
            <p className="lp-eyebrow">FAQ</p>
            <h2>Common questions</h2>
            <p>Everything you need to know before getting started with Good Gut Product.</p>
          </div>
          <div className="lp-faq-list">
            {FAQ.map((item) => (
              <details key={item.q} className="lp-faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="lp-cta">
        <div className="lp-container lp-cta-inner">
          <h2>Ready to launch your nutrition practice?</h2>
          <p>
            Join Good Gut Product today. Register as a nutritionist, add your first client, and
            start delivering care through the mobile app — all in under 10 minutes.
          </p>
          <div className="lp-cta-actions">
            <Link to="/register" className="btn btn-white btn-lg">
              Create free account
            </Link>
            <Link to="/login" className="btn btn-ghost-white btn-lg">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-grid">
          <div className="lp-footer-brand">
            <Link to="/" className="brand">
              <span className="brand-mark">GG</span>
              <span className="brand-text">
                Good Gut <em>Product</em>
              </span>
            </Link>
            <p>
              The professional SaaS platform for nutritionists to manage clients, diet plans, and
              consultations — powered by the Good Gut mobile ecosystem.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#platform">Platform</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/register">Register</Link>
            <Link to="/login">Sign in</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/admin">Platform admin</Link>
          </div>
          <div>
            <h4>Platform</h4>
            <span>Client mobile app (iOS)</span>
            <span>Client mobile app (Android)</span>
            <span>Nutritionist web dashboard</span>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <div className="lp-container">
            <p>© {new Date().getFullYear()} Good Gut Product. All rights reserved.</p>
            <div className="lp-footer-links">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
