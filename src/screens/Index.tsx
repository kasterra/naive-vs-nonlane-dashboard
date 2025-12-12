import { Link } from "react-router";

export default function Index() {
  return (
    <div className="p-6 h-dvh flex items-center justify-center">
      <div className="w-full max-w-xl text-center space-y-6">
        <h1 className="text-2xl font-semibold">Naive vs Non-Lane Dashboard</h1>
        <p className="text-muted-foreground">
          React 19 동시성 기능을 적용한 화면과 기본 동기 계산 화면을
          비교해보세요.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/naive"
            className="inline-flex items-center justify-center h-10 px-4 rounded-md border bg-background hover:bg-secondary"
          >
            Go to Naive
          </Link>
          <Link
            to="/deferred-transition"
            className="inline-flex items-center justify-center h-10 px-4 rounded-md border bg-background hover:bg-secondary"
          >
            Go to DeferredTransition
          </Link>
        </div>
      </div>
    </div>
  );
}
