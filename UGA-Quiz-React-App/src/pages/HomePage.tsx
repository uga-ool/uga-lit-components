import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="quiz-page">
      <header className="app-header util-margin-vert-lg">
        <h1>UGA Quiz</h1>
        <p className="util-margin-vert-md">
          Formative quiz app for eLC (D2L Brightspace). Built from the
          UGA-Brightspace-React-Apps template.
        </p>
      </header>

      <section>
        <h2>Get Started</h2>
        <p>
          <Link to="/quiz" className="link">
            Open the example quiz →
          </Link>
        </p>
      </section>

      <section className="util-margin-vert-lg">
        <h3>About</h3>
        <p>
          This app uses the <code>uga-quiz</code> web component from
          uga-lit-components, wrapped for React. Grades can be submitted to the
          eLC gradebook via the optional external API service.
        </p>
      </section>
    </div>
  );
}
