"use client"

import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {AlertCircle, CheckCircle2, Loader2} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Textarea} from "@/components/ui/textarea";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {FadeIn} from "@/components/fade-in";
import { submitApplication } from "./action";

const unitOptions = [
  { value: "160th SOAR(A) Aviator", label: "160th SOAR(A) Aviator" },
  { value: "SO Special Warfare Operator", label: "SO Special Warfare Operator" },
]

const timezoneOptions = [
  { value: "aft", label: "Afghanistan Time (AFT) (UTC+04:30)" },
  { value: "acst", label: "Australian Central Standard Time (ACST) (UTC+09:30)" },
  { value: "aest", label: "Australian Eastern Standard Time (AEST) (UTC+10)" },
  { value: "akst", label: "Alaska Standard Time (AKST) (UTC-09)" },
  { value: "utc-12", label: "Anywhere on Earth (UTC-12)" },
  { value: "gst_arabia", label: "Arabia Standard Time (AST/GST) (UTC+03)" },
  { value: "art", label: "Argentina Time (ART) (UTC-03)" },
  { value: "ast", label: "Atlantic Standard Time (AST/ADT) (UTC-04/-03)" },
  { value: "awst", label: "Australian Western Standard Time (AWST) (UTC+08)" },
  { value: "azot", label: "Azores Time (AZOT) (UTC-01)" },
  { value: "bdt", label: "Bangladesh Standard Time (BST) (UTC+06)" },
  { value: "bot", label: "Bolivia Time (BOT) (UTC-04)" },
  { value: "brt", label: "Brasília Time (BRT) (UTC-03)" },
  { value: "cat", label: "Central Africa Time (CAT) (UTC+02)" },
  { value: "cet", label: "Central European Time (CET/CEST) (UTC+01/+02)" },
  { value: "chast", label: "Chatham Standard Time (CHAST) (UTC+12:45)" },
  { value: "cst", label: "Central Time (CST/CDT) (UTC-06/-05)" },
  { value: "cst_china", label: "China Standard Time (CST) (UTC+08)" },
  { value: "clt", label: "Chile Standard Time (CLT/CLST) (UTC-04/-03)" },
  { value: "cot", label: "Colombia Time (COT) (UTC-05)" },
  { value: "utc", label: "Coordinated Universal Time (UTC)" },
  { value: "eat", label: "East Africa Time (EAT) (UTC+03)" },
  { value: "eet", label: "Eastern European Time (EET/EEST) (UTC+02/+03)" },
  { value: "est", label: "Eastern Time (EST/EDT) (UTC-05/-04)" },
  { value: "fjt", label: "Fiji Time (FJT) (UTC+12)" },
  { value: "gmt", label: "Greenwich Mean Time (GMT) (UTC+00)" },
  { value: "hst", label: "Hawaii Standard Time (HST) (UTC-10)" },
  { value: "ict", label: "Indochina Time (ICT) (UTC+07)" },
  { value: "ist_india", label: "Indian Standard Time (IST) (UTC+05:30)" },
  { value: "jst", label: "Japan Standard Time (JST) (UTC+09)" },
  { value: "kst", label: "Korean Standard Time (KST) (UTC+09)" },
  { value: "lint", label: "Line Islands Time (LINT) (UTC+14)" },
  { value: "lhst", label: "Lord Howe Standard Time (LHST) (UTC+10:30)" },
  { value: "military_alpha", label: "Alpha Time Zone (A) (UTC+01)" },
  { value: "military_zulu", label: "Zulu Time Zone (Z) (UTC+00)" },
  { value: "mmt", label: "Myanmar Time (MMT) (UTC+06:30)" },
  { value: "msk", label: "Moscow Standard Time (MSK) (UTC+03)" },
  { value: "mst", label: "Mountain Time (MST/MDT) (UTC-07/-06)" },
  { value: "nst", label: "Newfoundland Standard Time (NST/NDT) (UTC-03:30/-02:30)" },
  { value: "npt", label: "Nepal Time (NPT) (UTC+05:45)" },
  { value: "nzst", label: "New Zealand Standard Time (NZST/NZDT) (UTC+12/+13)" },
  { value: "pst", label: "Pacific Time (PST/PDT) (UTC-08/-07)" },
  { value: "pet", label: "Peru Time (PET) (UTC-05)" },
  { value: "pkt", label: "Pakistan Standard Time (PKT) (UTC+05)" },
  { value: "sast", label: "South African Standard Time (SAST) (UTC+02)" },
  { value: "telt", label: "Iran Standard Time (IRST/IRDT) (UTC+03:30/+04:30)" },
  { value: "tot", label: "Tonga Time (TOT) (UTC+13)" },
  { value: "vet", label: "Venezuelan Standard Time (VET) (UTC-04:30)" },
  { value: "wat", label: "West Africa Time (WAT) (UTC+01)" },
  { value: "wet", label: "Western European Time (WET) (UTC+00)" },
]

const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>

export default function JoinFormClient() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    discordName: "",
    email: "",
    dateOfBirth: "",
    steamId: "",
    mos: "",
    hasPreviousExperience: "no",
    previousUnits: "",
    reason: "",
    timezone: "",
    armaExperience: "",
    capabilities: "",
    confirmRequirements: false,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    if (session) {
      setFormData((prev) => ({
        ...prev,
        discordName: `${session.user.name}`,
      }))
    }
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (data: typeof formData) => {
    const errors: Record<string, string> = {}

    if (!data.name) {
      errors.name = "Name is required"
    } else {
      const nameRegex = /^[A-Z]\.\s.+$/
      if (!nameRegex.test(data.name)) {
        errors.name =
          "Invalid format. Name must be your first initial, a period, a space, and your last name (e.g., J. Doe)."
      }
    }
    if (!data.discordName) errors.discordName = "Discord name is required"
    if (!data.email) errors.email = "Email address is required"
    if (!data.email.includes("@")) errors.email = "Please enter a valid email address"
    if (!data.dateOfBirth) errors.dateOfBirth = "Date of birth is required"
    if (!data.steamId) errors.steamId = "Steam ID is required"
    if (!data.mos) errors.mos = "Please select a unit/role you want to join"
    if (data.hasPreviousExperience === "yes" && !data.previousUnits) {
      errors.previousUnits = "Please provide details of your previous units"
    }
    if (!data.reason) errors.reason = "Please tell us why you want to join"
    if (!data.timezone) errors.timezone = "Please select your timezone"
    if (!data.armaExperience) errors.armaExperience = "Please enter your Arma experience in hours"
    if (!data.capabilities) errors.capabilities = "Please tell us what makes you capable"
    if (!data.confirmRequirements) {
      errors.confirmRequirements = "You must confirm that you have read the requirements"
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionError(null);

    const correctedData = { ...formData }
    const nameValue = correctedData.name.trim()
    const missingSpaceRegex = /^[A-Z]\.[^\s]/
    if (missingSpaceRegex.test(nameValue)) {
      correctedData.name = nameValue.replace(".", ". ")
    }

    const errors = validateForm(correctedData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (correctedData.name !== formData.name) {
        setFormData(correctedData)
      }
      const firstErrorField = document.querySelector(
        `[name="${Object.keys(errors)[0]}"]`
      );
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setIsSubmitting(true)
    setFormData(correctedData)

    const formDataForAction = new FormData()
    Object.entries(correctedData).forEach(([key, value]) => {
      if (key === "mos") {
        formDataForAction.append("preferredPosition", value.toString())
      } else {
        formDataForAction.append(key, value.toString())
      }
    })

    try {
      await submitApplication(formDataForAction, session!.user.id!, session!.user.discordName!)
      setIsSubmitted(true);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Application Submission Failed:", error);
      if (error instanceof Error) {
        if (error.message.includes("PERSCOM_REPLACE_FAILED") || error.message.includes("PERSCOM_REPLACE_NOT_FOUND")) {
          setSubmissionError("This email is already in use. We tried to fix this automatically but failed. Please contact support.");
        }
        else if (error.message.includes("PERSCOM_CREATE_FAILED")) {
          setSubmissionError("There was a problem creating your user profile. Please check your details and try again.");
        }
        else if (error.message.includes("PERSCOM")) {
          setSubmissionError("There was a problem with our recruitment service. Please try again later or contact support.");
        }
        else if (error.message.includes("database")) {
          setSubmissionError("There was a problem updating our records. Please contact us.");
        }
        else {
          setSubmissionError("An unknown error occurred. Please try again later.");
        }
      } else {
        setSubmissionError("An unexpected error occurred. Please try again later.");
      }
    }
  };

  return (
    <FadeIn>
      {isSubmitted ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h3 className="text-2xl font-medium mb-2">Application Submitted</h3>
          <p className="text-gray-500 dark:text-zinc-400 mb-6">
            Thank you for your interest in joining NSWG1. We&apos;ll review your application and get back to you
            soon.
          </p>
          <Button onClick={() => router.push("/")} className="bg-accent hover:bg-accent-darker text-black">
            Return to Home
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-2">Application Form</h2>
          <p className="text-gray-500 dark:text-zinc-400 mb-6">
            All fields marked with <span className="text-red-500">*</span> are required.
          </p>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold border-b border-gray-200 dark:border-zinc-700 pb-2">
                Personal Information
              </h3>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Name (Format: J. Doe)
                  <RequiredIndicator />
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="J. Doe"
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discordName">
                  Discord Name
                  <RequiredIndicator />
                </Label>
                <Input
                  id="discordName"
                  name="discordName"
                  value={formData.discordName}
                  onChange={handleChange}
                  placeholder="Username#0000"
                  disabled={!!session}
                  className={formErrors.discordName ? "border-red-500" : ""}
                />
                {formErrors.discordName && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.discordName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address
                  <RequiredIndicator />
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Date of Birth
                  <RequiredIndicator />
                </Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={formErrors.dateOfBirth ? "border-red-500" : ""}
                />
                {formErrors.dateOfBirth && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.dateOfBirth}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="steamId">
                  Steam ID
                  <RequiredIndicator />
                </Label>
                <Input
                  id="steamId"
                  name="steamId"
                  value={formData.steamId}
                  onChange={handleChange}
                  placeholder="Your Steam ID or profile URL"
                  className={formErrors.steamId ? "border-red-500" : ""}
                />
                {formErrors.steamId && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.steamId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mos">
                  Which unit/role would you like to join?
                  <RequiredIndicator />
                </Label>
                <Select value={formData.mos} onValueChange={(value) => handleSelectChange("mos", value)}>
                  <SelectTrigger className={formErrors.mos ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select your preferred role" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="preferredPosition" value={formData.mos} />
                {formErrors.mos && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.mos}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Previous Unit Experience?
                  <RequiredIndicator />
                </Label>
                <RadioGroup
                  value={formData.hasPreviousExperience}
                  onValueChange={(value) => handleSelectChange("hasPreviousExperience", value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="experience-yes" />
                    <Label htmlFor="experience-yes" className="cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="experience-no" />
                    <Label htmlFor="experience-no" className="cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
                <input type="hidden" name="hasPreviousExperience" value={formData.hasPreviousExperience} />
              </div>

              {formData.hasPreviousExperience === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="previousUnits">
                    Name(s) of Previous Units
                    <RequiredIndicator />
                  </Label>
                  <Textarea
                    id="previousUnits"
                    name="previousUnits"
                    value={formData.previousUnits}
                    onChange={handleChange}
                    placeholder="List your previous units and roles"
                    rows={3}
                    className={formErrors.previousUnits ? "border-red-500" : ""}
                  />
                  {formErrors.previousUnits && (
                    <p className="text-red-500 text-sm flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.previousUnits}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Additional Information Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold border-b border-gray-200 dark:border-zinc-700 pb-2">
                Additional Information
              </h3>

              <div className="space-y-2">
                <Label htmlFor="reason">
                  Why do you want to join our community?
                  <RequiredIndicator />
                </Label>
                <Textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Tell us why you want to join and what you can bring to the team..."
                  rows={4}
                  className={formErrors.reason ? "border-red-500" : ""}
                />
                {formErrors.reason && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.reason}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">
                  What is your time zone?
                  <RequiredIndicator />
                </Label>
                <Select value={formData.timezone} onValueChange={(value) => handleSelectChange("timezone", value)}>
                  <SelectTrigger className={formErrors.timezone ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select your time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezoneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="timezone" value={formData.timezone} />
                {formErrors.timezone && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.timezone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="armaExperience">
                  Arma experience in hours
                  <RequiredIndicator />
                </Label>
                <Input
                  id="armaExperience"
                  name="armaExperience"
                  type="number"
                  value={formData.armaExperience}
                  onChange={handleChange}
                  placeholder="500"
                  min="0"
                  className={formErrors.armaExperience ? "border-red-500" : ""}
                />
                {formErrors.armaExperience && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.armaExperience}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capabilities">
                  What makes you more capable than other candidates?
                  <RequiredIndicator />
                </Label>
                <Textarea
                  id="capabilities"
                  name="capabilities"
                  value={formData.capabilities}
                  onChange={handleChange}
                  placeholder="Describe your skills, experience, and what sets you apart..."
                  rows={4}
                  className={formErrors.capabilities ? "border-red-500" : ""}
                />
                {formErrors.capabilities && (
                  <p className="text-red-500 text-sm flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.capabilities}
                  </p>
                )}
              </div>
            </div>

            {/* Confirmation Section */}
            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="confirmRequirements"
                  checked={formData.confirmRequirements}
                  onCheckedChange={(checked) => handleCheckboxChange("confirmRequirements", checked === true)}
                  className={formErrors.confirmRequirements ? "border-red-500" : ""}
                />
                <div className="space-y-1">
                  <Label htmlFor="confirmRequirements" className="cursor-pointer">
                    I confirm that I have read and understand the recruitment requirements on the website
                    <RequiredIndicator />
                  </Label>
                  {formErrors.confirmRequirements && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" /> {formErrors.confirmRequirements}
                    </p>
                  )}
                </div>
              </div>

              {submissionError && (
                <p className="text-red-500 text-sm flex items-center mt-1 p-2 bg-red-500/10 rounded-md">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" /> {submissionError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent-darker text-black"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>


        </div>
      )}
    </FadeIn>

  )
}