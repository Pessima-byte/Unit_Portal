import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, BookOpen, Users, MapPin, Globe, Mail, Phone, ChevronRight, Activity, Building2 } from "lucide-react"

export default async function CollegePage({ params }: { params: { slug: string } }) {
    const college = await db.college.findUnique({
        where: { slug: params.slug },
        include: {
            departments: {
                include: {
                    courses: {
                        where: { isActive: true },
                        take: 3,
                    },
                },
            },
            announcements: {
                where: { isPublished: true },
                orderBy: { createdAt: 'desc' },
                take: 3,
            },
        },
    })

    if (!college) {
        notFound()
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Navigation */}
            <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <Link className="flex items-center justify-center font-bold text-xl" href="/">
                    <GraduationCap className="h-6 w-6 mr-2 text-primary" />
                    UniPortal
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
                    <Link className="text-sm font-medium hover:text-primary transition-colors" href="/">
                        Main Campus
                    </Link>
                    <Link href={`/register?collegeId=${college.id}`}>
                        <Button size="sm">Apply to {college.slug.toUpperCase()}</Button>
                    </Link>
                </nav>
            </header>

            <main className="flex-1">
                {/* College Hero Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary/5 via-primary/10 to-background">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="p-3 bg-primary/10 rounded-full mb-4">
                                <Building2 className="h-12 w-12 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-primary capitalize">
                                {college.name}
                            </h1>
                            <p className="mx-auto max-w-[800px] text-gray-500 md:text-xl dark:text-gray-400">
                                {college.description || "Leading excellence in academic research and student development."}
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 mt-8">
                                {college.address && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="h-4 w-4 mr-1 text-primary" />
                                        {college.address}
                                    </div>
                                )}
                                {college.website && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Globe className="h-4 w-4 mr-1 text-primary" />
                                        <a href={college.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            Website
                                        </a>
                                    </div>
                                )}
                                {college.email && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Mail className="h-4 w-4 mr-1 text-primary" />
                                        {college.email}
                                    </div>
                                )}
                            </div>
                            <div className="pt-8">
                                <Link href={`/register?collegeId=${college.id}`}>
                                    <Button size="lg" className="h-12 px-8 rounded-full shadow-lg">
                                        Start Your Application
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Departments Section */}
                <section className="w-full py-12 md:py-24">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Departments</h2>
                            <p className="max-w-[800px] text-gray-500 md:text-lg">
                                Explore our specialized departments and the world-class programs they offer.
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {college.departments.length === 0 ? (
                                <div className="col-span-full text-center p-12 border border-dashed rounded-xl bg-muted/30">
                                    <p className="text-muted-foreground">Departments list coming soon.</p>
                                </div>
                            ) : (
                                college.departments.map((dept: any) => (
                                    <Card key={dept.id} className="hover:shadow-lg transition-all border-muted group">
                                        <CardHeader>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="p-2 bg-primary/5 rounded-lg">
                                                    <BookOpen className="h-5 w-5 text-primary" />
                                                </div>
                                                <span className="text-xs font-bold bg-muted px-2 py-1 rounded tracking-wider uppercase">
                                                    {dept.code}
                                                </span>
                                            </div>
                                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                                {dept.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                {dept.description || `The Department of ${dept.name} is dedicated to excellence in teaching and research.`}
                                            </p>
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Top Programs:</h4>
                                                {dept.courses.length === 0 ? (
                                                    <span className="text-xs text-muted-foreground italic">Updating courses...</span>
                                                ) : (
                                                    dept.courses.map((course: any) => (
                                                        <div key={course.id} className="flex items-center text-xs text-gray-600">
                                                            <ChevronRight className="h-3 w-3 mr-1 text-primary" />
                                                            {course.name}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* College Announcements */}
                {college.announcements.length > 0 && (
                    <section className="w-full py-12 md:py-24 bg-muted/30">
                        <div className="container px-4 md:px-6">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Latest Updates</h2>
                                    <p className="text-muted-foreground mt-2">News and events from {college.name}</p>
                                </div>
                            </div>
                            <div className="grid gap-6 md:grid-cols-3">
                                {college.announcements.map((ann: any) => (
                                    <Card key={ann.id} className="border-none shadow-sm">
                                        <CardHeader className="pb-2">
                                            <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${ann.type === 'URGENT' ? 'text-red-500' : 'text-primary'
                                                }`}>
                                                {ann.type}
                                            </div>
                                            <CardTitle className="text-lg line-clamp-2">{ann.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                                {ann.content}
                                            </p>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(ann.createdAt).toLocaleDateString()}
                                            </span>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Final CTA */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-primary">
                    <div className="container px-4 md:px-6 text-center text-primary-foreground">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6">Join {college.name} Today</h2>
                        <p className="max-w-[600px] mx-auto mb-8 text-primary-foreground/80 md:text-lg">
                            Take the next step in your academic journey. Our application portal is now open for the 2026 academic year.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href={`/register?collegeId=${college.id}`}>
                                <Button variant="secondary" size="lg" className="h-12 px-8 font-bold">
                                    Apply Now
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="outline" size="lg" className="h-12 px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                                    Explore other Colleges
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-6 border-t bg-background">
                <div className="container px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">© 2026 {college.name} | Part of UniPortal Network</p>
                    <nav className="flex gap-4 sm:ml-auto">
                        <Link className="text-xs hover:underline underline-offset-4" href="#">Privacy Policy</Link>
                        <Link className="text-xs hover:underline underline-offset-4" href="#">Terms of Admission</Link>
                    </nav>
                </div>
            </footer>
        </div>
    )
}
