"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { submitStudentApplication, getRegistrationCourses } from "../actions/authActions"

export function RegisterForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const queryCollegeId = searchParams.get("collegeId")
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [courses, setCourses] = useState<{ id: string; name: string; code: string }[]>([])
    const [colleges, setColleges] = useState<{ id: string; name: string }[]>([])
    const [fetchingCourses, setFetchingCourses] = useState(false)

    // Form Data State
    const [formData, setFormData] = useState({
        // Step 1: Account
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",

        // Step 2: Personal
        dateOfBirth: "",
        gender: "",
        nationality: "",
        religion: "",
        placeOfBirth: "",
        address: "",

        // Step 3: Guardian
        guardianName: "",
        guardianRelationship: "",
        guardianPhone: "",
        guardianEmail: "",
        guardianAddress: "",

        // Step 4: Education & Program
        previousSchool: "",
        graduationYear: "",
        grades: "", // Description of grades
        collegeId: "",
        courseId: "",
    })

    useEffect(() => {
        // Fetch colleges for dropdown
        import("../actions/authActions").then(({ getColleges }) => {
            getColleges().then((res) => {
                if (res.success && res.colleges) {
                    setColleges(res.colleges)

                    // If collegeId in query, set it
                    if (queryCollegeId) {
                        const collegeExists = res.colleges.some((c: any) => c.id === queryCollegeId)
                        if (collegeExists) {
                            setFormData(prev => ({ ...prev, collegeId: queryCollegeId }))
                        }
                    }
                }
            })
        })
    }, [queryCollegeId])

    useEffect(() => {
        if (formData.collegeId) {
            setFetchingCourses(true)
            getRegistrationCourses(formData.collegeId).then((res) => {
                if (res.success && res.courses) {
                    setCourses(res.courses as { id: string; name: string; code: string }[])
                }
                setFetchingCourses(false)
            })
        } else {
            setCourses([])
        }
    }, [formData.collegeId])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const validateStep = (currentStep: number) => {
        setError("")
        if (currentStep === 1) {
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) return false
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match")
                return false
            }
            return true
        }
        if (currentStep === 2) {
            return formData.dateOfBirth && formData.gender && formData.nationality && formData.address
        }
        if (currentStep === 3) {
            return formData.guardianName && formData.guardianRelationship && formData.guardianPhone
        }
        if (currentStep === 4) {
            return formData.previousSchool && formData.graduationYear && formData.collegeId && formData.courseId
        }
        return true
    }

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1)
        } else if (!error) {
            setError("Please fill all required fields correctly.")
        }
    }

    const prevStep = () => {
        setStep(step - 1)
        setError("")
    }

    const handleSubmit = async () => {
        if (!validateStep(4)) {
            if (!error) setError("Please complete all required fields.")
            return
        }
        setLoading(true)
        setError("")

        try {
            const res = await submitStudentApplication({
                ...formData,
                dateOfBirth: new Date(formData.dateOfBirth),
                graduationYear: parseInt(formData.graduationYear),
            })

            if (res.success) {
                router.push("/login?registered=true")
            } else {
                setError(res.error || "Failed to submit application")
            }
        } catch (err) {
            console.error(err)
            setError("An unexpected error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-4xl mx-auto border-none shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold text-primary">Student Application Portal</CardTitle>
                        <CardDescription className="text-gray-500 mt-1">
                            {step === 1 && "Start your journey by creating an applicant account."}
                            {step === 2 && "Tell us a bit about yourself."}
                            {step === 3 && "Provide details about your guardian and background."}
                            {step === 4 && "Select your program and academic history."}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center">
                                <div
                                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${s === step
                                        ? "bg-primary text-primary-foreground scale-110 shadow-lg"
                                        : s < step
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-100 text-gray-400"
                                        }`}
                                >
                                    {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
                                </div>
                                {s < 4 && (
                                    <div
                                        className={`h-1 w-6 md:w-12 mx-1 rounded-full transition-colors duration-300 ${s < step ? "bg-green-500" : "bg-gray-100"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 md:p-8 min-h-[400px]">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                {/* Step 1: Account Information */}
                {step === 1 && (
                    <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                placeholder="Ex. John"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                placeholder="Ex. Doe"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john.doe@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Repeat password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Personal Details */}
                {step === 2 && (
                    <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                            <Input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender *</Label>
                            <Select name="gender" value={formData.gender} onValueChange={(val) => handleSelectChange("gender", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nationality">Nationality *</Label>
                            <Input
                                id="nationality"
                                name="nationality"
                                placeholder="Ex. American"
                                value={formData.nationality}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="religion">Religion (Optional)</Label>
                            <Input
                                id="religion"
                                name="religion"
                                placeholder="Ex. Christian, Muslim, etc."
                                value={formData.religion}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="placeOfBirth">Place of Birth (Optional)</Label>
                            <Input
                                id="placeOfBirth"
                                name="placeOfBirth"
                                placeholder="City, Country"
                                value={formData.placeOfBirth}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="address">Permanent Address *</Label>
                            <Textarea
                                id="address"
                                name="address"
                                placeholder="Street Address, City, State, Zip Code"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Guardian Details */}
                {step === 3 && (
                    <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="col-span-2">
                            <h3 className="text-lg font-semibold mb-2">Guardian Information</h3>
                            <p className="text-sm text-muted-foreground mb-4">Please provide details of your parent or legal guardian.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guardianName">Guardian Name *</Label>
                            <Input
                                id="guardianName"
                                name="guardianName"
                                placeholder="Full Name"
                                value={formData.guardianName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guardianRelationship">Relationship *</Label>
                            <Select name="guardianRelationship" value={formData.guardianRelationship} onValueChange={(val) => handleSelectChange("guardianRelationship", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Father">Father</SelectItem>
                                    <SelectItem value="Mother">Mother</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guardianPhone">Guardian Phone *</Label>
                            <Input
                                id="guardianPhone"
                                name="guardianPhone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={formData.guardianPhone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guardianEmail">Guardian Email (Optional)</Label>
                            <Input
                                id="guardianEmail"
                                name="guardianEmail"
                                type="email"
                                placeholder="guardian@example.com"
                                value={formData.guardianEmail}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="guardianAddress">Guardian Address (If different)</Label>
                            <Textarea
                                id="guardianAddress"
                                name="guardianAddress"
                                placeholder="Leave blank if same as applicant"
                                value={formData.guardianAddress}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                )}

                {/* Step 4: Education & Program */}
                {step === 4 && (
                    <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="col-span-2">
                            <h3 className="text-lg font-semibold mb-2">Academic Background</h3>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="previousSchool">Previous School / Institution *</Label>
                            <Input
                                id="previousSchool"
                                name="previousSchool"
                                placeholder="High School Name"
                                value={formData.previousSchool}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="graduationYear">Graduation Year *</Label>
                            <Input
                                id="graduationYear"
                                name="graduationYear"
                                type="number"
                                placeholder="Ex. 2024"
                                min="1990"
                                max="2030"
                                value={formData.graduationYear}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="grades">Detailed Grades / Results (Summary)</Label>
                            <Textarea
                                id="grades"
                                name="grades"
                                placeholder="List your key subjects and grades (e.g., Math: A, English: B...)"
                                value={formData.grades}
                                onChange={handleChange}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="col-span-2 mt-4">
                            <h3 className="text-lg font-semibold mb-2">Institution & Program Selection</h3>
                            <p className="text-sm text-muted-foreground mb-4">Choose the college and course you wish to apply for.</p>
                        </div>
                        <div className="col-span-2 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="collegeId">Select College *</Label>
                                <Select name="collegeId" value={formData.collegeId} onValueChange={(val) => handleSelectChange("collegeId", val)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a college..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {colleges.map((college) => (
                                            <SelectItem key={college.id} value={college.id}>
                                                {college.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="courseId">Select Course *</Label>
                                <Select
                                    name="courseId"
                                    value={formData.courseId}
                                    onValueChange={(val) => handleSelectChange("courseId", val)}
                                    disabled={!formData.collegeId || fetchingCourses}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={!formData.collegeId ? "Select a college first" : fetchingCourses ? "Loading courses..." : "Select a program..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.code} - {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="col-span-2 mt-4 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                            <strong>Note:</strong> By clicking Submit, you declare that all information provided is true and accurate.
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex justify-between bg-gray-50 border-t p-6 rounded-b-xl">
                {step > 1 ? (
                    <Button variant="outline" onClick={prevStep} disabled={loading} className="gap-2">
                        <ChevronLeft className="h-4 w-4" /> Back
                    </Button>
                ) : (
                    <div className="text-sm text-gray-500">
                        Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
                    </div>
                )}

                {step < 4 ? (
                    <Button onClick={nextStep} className="gap-2">
                        Next Step <ChevronRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={loading} className="gap-2 min-w-[150px]">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Submit Application
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
