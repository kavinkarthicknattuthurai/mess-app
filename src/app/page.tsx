import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="card">
        <div>
          <div className="mb-6 text-center">
            <h1 className="text-4xl mb-1">Extrabite</h1>
            <p className="text-accent">from the mess representative jothiragav</p>
          </div>

          <form className="space-y-6 mt-8">
            <div>
              <input
                type="text"
                placeholder="Student Name"
                className="input"
                required
              />
            </div>
            
            <div>
              <input
                type="text"
                placeholder="Student ID"
                className="input"
                required
              />
            </div>
            
            <Link href="/month-selection" className="block mt-4">
              <button
                type="button"
                className="btn-primary"
              >
                Submit
              </button>
            </Link>
          </form>
        </div>
        
        <div className="mt-10">
          <Link href="/admin" className="block">
            <button
              type="button"
              className="btn-secondary"
            >
              Admin Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
