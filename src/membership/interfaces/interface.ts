export interface RegistrationInput {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    studyClass: string;
    course: string;
    yearOfStudy: string;
    dateOfBirth: string;
}

export interface PendingApplicationView {
    applicationId: string;
    submittedAt: Date;
    expiresAt: Date;
    gsApprovalRecorded: boolean;
    applicant: {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        class: string;
        course: string;
        yearOfStudy: string;
        dateOfBirth: string;
    };
}

export interface OnboardingResult {
    onboardingCompleted: true;
    ministries: { id: string; name: string }[];
}