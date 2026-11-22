import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-luxe py-32 text-center">
      <p className="eyebrow">404</p>
      <h1 className="heading-display mt-4 text-5xl">—</h1>
      <Link href="/" className="btn btn-dark mt-10">YUSUF SCORE</Link>
    </div>
  );
}
