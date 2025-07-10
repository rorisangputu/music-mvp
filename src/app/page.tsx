import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-screen py-10">
      <div className="w-[90%] mx-auto flex flex-col">
        <section className="py-2 space-y-5">
          <div className="bg-gray-200 h-[40vh] space-y-5 rounded-md flex flex-col justify-center items-center">
            <h1 className="text-slate-700 text-2xl max-w-[30%] text-center">
              CMMG Production Music Library
            </h1>
            <Link
              href={"/albums"}
              className="bg-blue-900 text-white py-2 px-3 rounded-md"
            >
              Explore
            </Link>
          </div>
          <div>
            <h1 className="text-xl font-semibold">How Licensing Works.</h1>
            <p></p>
          </div>
        </section>
      </div>
    </div>
  );
}
