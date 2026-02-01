"use client";

import {
    Button,
    Input,
    Select,
    Tag,
    GithubIcon,
    LinkedinIcon,
    XIcon,
} from "@akxr/design-system";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const profileSchema = z.object({
    internship: z.string().optional(),
    collegeYear: z.string().optional(),
    skills: z.array(z.string()).min(1, "Please select at least one skill"),
    githubProfile: z.string().optional(),
    linkedinProfile: z.string().optional(),
    xProfile: z.string().optional(),
    zulipUsername: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const internshipOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "currently", label: "Currently doing one" },
];

const collegeYearOptions = [
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
    { value: "graduated", label: "Graduated" },
];

const availableSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "NextJS",
    "Vue",
    "Angular",
    "Node.js",
    "Python",
    "Go",
    "Rust",
    "CSS",
    "HTML",
    "Tailwind",
    "Redux",
    "GraphQL",
    "PostgreSQL",
    "MongoDB",
    "Docker",
    "AWS",
    "Git",
];

// Required asterisk component
const RequiredAsterisk = () => <span className="text-error ml-1">*</span>;

export default function CompleteProfilePage() {
    const [skillSearch, setSkillSearch] = useState("");
    const [showSkillDropdown, setShowSkillDropdown] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            internship: "",
            collegeYear: "",
            skills: [],
            githubProfile: "",
            linkedinProfile: "",
            xProfile: "",
            zulipUsername: "",
        },
    });

    const selectedSkills = watch("skills");

    const filteredSkills = availableSkills.filter(
        (skill) =>
            skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
            !selectedSkills.includes(skill)
    );

    // Check if the current search term is a valid custom skill
    const trimmedSearch = skillSearch.trim();
    const isCustomSkill =
        trimmedSearch.length > 0 &&
        !availableSkills.some(
            (skill) => skill.toLowerCase() === trimmedSearch.toLowerCase()
        ) &&
        !selectedSkills.some(
            (skill) => skill.toLowerCase() === trimmedSearch.toLowerCase()
        );

    const addSkill = (skill: string) => {
        const trimmed = skill.trim();
        if (trimmed && !selectedSkills.includes(trimmed)) {
            setValue("skills", [...selectedSkills, trimmed]);
        }
        setSkillSearch("");
        setShowSkillDropdown(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (isCustomSkill) {
                addSkill(trimmedSearch);
            } else if (filteredSkills.length > 0) {
                addSkill(filteredSkills[0]);
            }
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setValue(
            "skills",
            selectedSkills.filter((skill) => skill !== skillToRemove)
        );
    };

    const onSubmit = async (data: ProfileFormData) => {
        console.log("Profile data:", data);
        // Handle profile completion logic here
    };

    return (
        <main className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-text-primary">
                        Complete the form to get started
                    </h1>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Internship & College Year Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name="internship"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Internship"
                                    placeholder="Have you done any internships"
                                    options={internshipOptions}
                                    {...field}
                                />
                            )}
                        />
                        <Controller
                            name="collegeYear"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="College Year"
                                    placeholder="Select year"
                                    options={collegeYearOptions}
                                    {...field}
                                />
                            )}
                        />
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="text-sm font-medium text-text-primary flex items-center mb-2">
                            Skills
                            <RequiredAsterisk />
                        </label>
                        <div className="relative">
                            <div
                                className={`flex items-center w-full rounded-md border bg-bg-primary h-12 px-4 transition-all duration-150 ${showSkillDropdown
                                    ? "border-border-focus ring-1 ring-border-focus"
                                    : "border-border-default"
                                    } ${errors.skills ? "border-error" : ""}`}
                            >
                                <input
                                    type="text"
                                    placeholder="Search or add your skills"
                                    value={skillSearch}
                                    onChange={(e) => setSkillSearch(e.target.value)}
                                    onFocus={() => setShowSkillDropdown(true)}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 h-full bg-transparent text-text-primary outline-none placeholder:text-text-muted"
                                />
                                <svg
                                    className="w-4 h-4 text-text-muted"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>

                            {/* Dropdown */}
                            {showSkillDropdown && (filteredSkills.length > 0 || isCustomSkill) && (
                                <div className="absolute z-10 w-full mt-1 bg-bg-secondary border border-border-default rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {/* Custom skill option */}
                                    {isCustomSkill && (
                                        <button
                                            type="button"
                                            onClick={() => addSkill(trimmedSearch)}
                                            className="w-full text-left px-4 py-2 text-brand hover:bg-bg-elevated transition-colors cursor-pointer flex items-center gap-2"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                            Add &quot;{trimmedSearch}&quot;
                                        </button>
                                    )}
                                    {filteredSkills.map((skill) => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => addSkill(skill)}
                                            className="w-full text-left px-4 py-2 text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Skills Tags */}
                        {selectedSkills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {selectedSkills.map((skill) => (
                                    <Tag key={skill} onRemove={() => removeSkill(skill)}>
                                        {skill}
                                    </Tag>
                                ))}
                            </div>
                        )}

                        {errors.skills && (
                            <span className="text-sm text-error mt-2 block">
                                {errors.skills.message}
                            </span>
                        )}
                    </div>

                    {/* GitHub & LinkedIn Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="GitHub profile"
                            placeholder="Enter your GitHub username"
                            rightIcon={<GithubIcon size={18} />}
                            {...register("githubProfile")}
                        />
                        <Input
                            label="LinkedIn profile"
                            placeholder="Enter your LinkedIn username"
                            rightIcon={<LinkedinIcon size={18} />}
                            {...register("linkedinProfile")}
                        />
                    </div>

                    {/* X & Zulip Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="X profile"
                            placeholder="Enter your X username"
                            rightIcon={<XIcon size={18} />}
                            {...register("xProfile")}
                        />
                        <Input
                            label="Zulip username"
                            placeholder="Enter your Zulip username"
                            {...register("zulipUsername")}
                        />
                    </div>

                    {/* Finish Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={isSubmitting}
                    >
                        Finish
                    </Button>
                </form>
            </div>
        </main>
    );
}
