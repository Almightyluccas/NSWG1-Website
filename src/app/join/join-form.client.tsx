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
  { value: "tf160th", label: "Task Force 160th (Aviation)" },
  { value: "tacdevron2", label: "TACDEVRON2 (Maritime)" },
]

const timezoneOptions = [
  { value: "est", label: "Eastern Time (EST/EDT)" },
  { value: "cst", label: "Central Time (CST/CDT)" },
  { value: "mst", label: "Mountain Time (MST/MDT)" },
  { value: "pst", label: "Pacific Time (PST/PDT)" },
  { value: "gmt", label: "Greenwich Mean Time (GMT)" },
  { value: "cet", label: "Central European Time (CET)" },
  { value: "aest", label: "Australian Eastern Time (AEST)" },
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

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name) errors.name = "Name is required"
    if (!formData.discordName) errors.discordName = "Discord name is required"
    if (!formData.email) errors.email = "Email address is required"
    if (!formData.email.includes("@")) errors.email = "Please enter a valid email address"
    if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required"
    if (!formData.steamId) errors.steamId = "Steam ID is required"
    if (!formData.mos) errors.mos = "Please select a unit/role you want to join"
    if (formData.hasPreviousExperience === "yes" && !formData.previousUnits) {
      errors.previousUnits = "Please provide details of your previous units"
    }
    if (!formData.reason) errors.reason = "Please tell us why you want to join"
    if (!formData.timezone) errors.timezone = "Please select your timezone"
    if (!formData.armaExperience) errors.armaExperience = "Please enter your Arma experience in hours"
    if (!formData.capabilities) errors.capabilities = "Please tell us what makes you capable"
    if (!formData.confirmRequirements) {
      errors.confirmRequirements = "You must confirm that you have read the requirements"
    }

    return errors
  }
  // TODO: fix form validation especially for name to match regex

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorField = document.querySelector(
        `[name="${Object.keys(errors)[0]}"]`
      );
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setIsSubmitting(true)
    await submitApplication(new FormData(e.currentTarget), session!.user.id!, session!.user.discordName!).then(() => setIsSubmitted(true));
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
                {/* Hidden input for Timezone */}
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