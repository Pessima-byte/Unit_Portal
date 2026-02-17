import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, FileText, CheckCircle2, Hammer, Microscope, LineChart, BookOpen, Atom, Scale } from "lucide-react"
import { db } from "@/lib/db"
export default async function Home() {
  const session = await getServerSession(authOptions)

  const colleges = (db as any).college ? await (db as any).college.findMany({
    orderBy: { name: 'asc' },
  }) : []

  if (session) {
    const role = session.user.role

    switch (role) {
      case "STUDENT":
        redirect("/student")
      case "LECTURER":
        redirect("/lecturer")
      case "ADMIN":
        redirect("/admin")
      case "FINANCE":
        redirect("/finance")
      default:
        redirect("/login")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link className="flex items-center justify-center font-bold text-xl" href="#">
          <GraduationCap className="h-6 w-6 mr-2 text-primary" />
          UniPortal
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden md:block" href="#admissions">
            Admissions
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden md:block" href="#faculties">
            Faculties
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">Log In</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Apply Now</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-primary/5 via-primary/10 to-background relative overflow-hidden z-10">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                  Shape Your Future
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Excellence in Education, Innovation in Research. Join our community of global leaders.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button className="h-11 px-8 rounded-full shadow-lg hover:shadow-xl transition-all" size="lg">
                    Start Application
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" className="h-11 px-8 rounded-full" size="lg">Learn More</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* Colleges Section */}
        <section className="w-full py-12 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-600 font-medium">
                Our Institutions
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Explore Our Colleges</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl dark:text-gray-400">
                Discover the diverse academic institutions that make up our university system.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {colleges.length === 0 ? (
                <div className="col-span-full text-center p-12 border border-dashed rounded-xl bg-muted/30">
                  <p className="text-muted-foreground">No colleges listed at the moment.</p>
                </div>
              ) : (
                colleges.map((college: any) => (
                  <Link href={`/college/${college.slug}`} key={college.id}>
                    <Card className="h-full hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer overflow-hidden border-muted group">
                      <div className="h-3 w-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                      <CardHeader>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {college.name}
                        </CardTitle>
                        <CardDescription>{college.address}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {college.description}
                        </p>
                        <Button variant="link" className="px-0 mt-4 text-primary font-medium group-hover:translate-x-1 transition-transform">
                          Explore College &rarr;
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Announcements Section */}
        <section className="w-full py-12 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-orange-100 px-3 py-1 text-sm text-orange-600 font-medium">
                Latest Updates
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">University Announcements</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl dark:text-gray-400">
                Stay informed with the latest news and events from our campus.
              </p>
            </div>

            {/* Fetch and display announcements - Refreshing client context */}
            {await (async () => {
              const announcements = await (db.announcement as any).findMany({
                where: {
                  isPublished: true,
                  targetRole: null, // Public announcements
                },
                include: {
                  college: {
                    select: { slug: true, name: true }
                  }
                },
                orderBy: { createdAt: 'desc' },
                take: 3,
              })

              if (announcements.length === 0) {
                return (
                  <div className="text-center p-12 border border-dashed rounded-xl bg-muted/30">
                    <p className="text-muted-foreground">No active announcements at the moment. Check back later.</p>
                  </div>
                )
              }

              return (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {announcements.map((item: any) => (
                    <Card key={item.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card group overflow-hidden flex flex-col">
                      <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-red-500" />
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.type === 'URGENT' ? 'bg-red-100 text-red-600' :
                            item.type === 'ACADEMIC' ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                            {item.type}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </CardTitle>
                        {item.college && (
                          <div className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mt-1">
                            {item.college.name}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-muted-foreground line-clamp-3 text-sm">
                          {item.content}
                        </p>
                      </CardContent>
                      <div className="p-6 pt-0">
                        {item.college ? (
                          <Link href={`/college/${item.college.slug}`}>
                            <Button variant="link" className="px-0 text-primary font-medium group-hover:translate-x-1 transition-transform">
                              Read more &rarr;
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="link" className="px-0 text-primary font-medium group-hover:translate-x-1 transition-transform cursor-default opacity-70">
                            Global Update
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )
            })()}

          </div>
        </section>

        {/* Admissions Section */}
        <section id="admissions" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">Admissions Open</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Join Our 2026 Cohort</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                We are looking for bright minds. Our admission process is simple and transparent.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-stretch gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="p-3 w-fit rounded-full bg-primary/10 mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>1. Register</CardTitle>
                  <CardDescription>Create your applicant account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Sign up with your email to access the admissions portal and track your application.</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="p-3 w-fit rounded-full bg-primary/10 mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>2. Apply</CardTitle>
                  <CardDescription>Submit your details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Fill out the application form, upload your transcripts, and submit your personal statement.</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="p-3 w-fit rounded-full bg-primary/10 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>3. Enrol</CardTitle>
                  <CardDescription>Start your journey.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Receive your offer letter, complete the enrollment process, and join the orientation.</p>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto px-12">Apply for Admission Now</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
              <div className="flex flex-col items-center justify-center p-6 bg-background rounded-xl shadow-sm">
                <span className="text-4xl font-bold text-primary">15K+</span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider mt-2">Students</span>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-background rounded-xl shadow-sm">
                <span className="text-4xl font-bold text-primary">120+</span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider mt-2">Programs</span>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-background rounded-xl shadow-sm">
                <span className="text-4xl font-bold text-primary">50+</span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider mt-2">Countries</span>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-background rounded-xl shadow-sm">
                <span className="text-4xl font-bold text-primary">98%</span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider mt-2">Employment</span>
              </div>
            </div>
          </div>
        </section>

        {/* Faculties Section */}
        <section id="faculties" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-12 sm:text-4xl">Our Faculties</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Engineering", icon: Hammer },
                { title: "Medicine", icon: Microscope },
                { title: "Business", icon: LineChart },
                { title: "Arts", icon: BookOpen },
                { title: "Science", icon: Atom },
                { title: "Law", icon: Scale }
              ].map((faculty, i) => (
                <Card key={i} className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer overflow-hidden border-muted">
                  <CardHeader className="flex flex-row items-center gap-4 bg-muted/30">
                    <faculty.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{faculty.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">World-class programs designed for the future.</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary">
          <div className="container px-4 md:px-6 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6">Ready to get started?</h2>
            <Link href="/register">
              <Button variant="secondary" size="lg" className="h-12 px-8 text-primary font-bold text-lg">
                Apply Today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
        <p className="text-xs text-muted-foreground">© 2026 UniPortal Inc.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">Privacy</Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">Terms</Link>
        </nav>
      </footer>
    </div>
  )
}




