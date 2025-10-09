import { Link } from "react-router-dom";

const featureList = [
  {
    title: "Predictive Hotspots",
    description: "Leverage historical FIR data to reveal emerging hotspots before incidents occur.",
  },
  {
    title: "Intelligent Patrol Routes",
    description: "Generate optimized patrol paths that cover high-risk zones efficiently.",
  },
  {
    title: "Insightful Analytics",
    description: "Monitor crime trends, track alerts, and plan resources with a unified dashboard.",
  },
];

const Landing = () => {
  return (
    <main className="landing">
      <section className="landing__hero">
        <div className="landing__hero-text">
          <h1>Predict Risk. Deploy Smarter. Keep Communities Safe.</h1>
          <p>
            A rapid 20-hour prototype built to move policing from reactive response to proactive prevention.
            Discover hotspots, forecast crime patterns, and orchestrate patrols with data-driven clarity.
          </p>
          <div className="landing__cta">
            <Link to="/signup" className="btn btn--primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn--secondary">
              View Dashboard
            </Link>
          </div>
        </div>
        <div className="landing__hero-card">
          <p className="landing__hero-card-title">Project Overview</p>
          <ul>
            <li>
              <span>Duration</span>
              <strong>20 Hours</strong>
            </li>
            <li>
              <span>Location</span>
              <strong>GLA University, Mathura</strong>
            </li>
            <li>
              <span>Status</span>
              <strong>Planning Phase</strong>
            </li>
          </ul>
        </div>
      </section>

      <section className="landing__features">
        {featureList.map((feature) => (
          <article key={feature.title}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="landing__timeline">
        <h2>20-Hour Delivery Roadmap</h2>
        <div className="timeline__grid">
          <div>
            <h4>Hours 0–6</h4>
            <p>Collect, clean, and structure FIR datasets. Set up the API foundation and database schema.</p>
          </div>
          <div>
            <h4>Hours 6–14</h4>
            <p>Train clustering and forecasting models. Generate patrol logic and analytics dashboards.</p>
          </div>
          <div>
            <h4>Hours 14–20</h4>
            <p>Integrate frontend experiences, polish the user journey, and craft the final pitch assets.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing;
