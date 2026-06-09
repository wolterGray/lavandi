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
        <div className="flex min-h-screen flex-col items-center justify-center bg-void px-6 text-center text-milk">
          <p className="text-sm text-gold">Something went wrong</p>
          <p className="mt-4 max-w-lg text-sm text-stone">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full border border-white/20 px-6 py-3 text-sm transition hover:border-gold/40"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
