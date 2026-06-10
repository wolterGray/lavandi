import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
          <p className="text-sm font-bold text-gold">Something went wrong</p>
          <p className="mt-4 max-w-lg text-sm text-stone">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-pill border border-border/20 px-6 py-3 text-sm text-milk transition hover:border-gold hover:text-gold"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
