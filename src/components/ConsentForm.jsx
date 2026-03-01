import React, { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "./firebaseConfig";
import { ref, update, set } from "firebase/database";
import { toast } from "react-hot-toast";

const ConsentForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Section C - Participant Details
    name: "",
    gender: "",
    bloodGroup: "",
    age: "",
    weight: "",
    height: "",
    hasSugar: "",
    hasBP: "",
    otherConditions: "",
    sugarLevel: "",
    pulseRate: "",
    spO2Level: "",
    bloodPressure: "",
    // Declaration
    agreedToConsent: false,
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const user = auth.currentUser;

  // Calculate BMI automatically
  const bmi = useMemo(() => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height);
    if (w > 0 && h > 0) {
      const heightInMeters = h / 100;
      return (w / (heightInMeters * heightInMeters)).toFixed(2);
    }
    return "";
  }, [formData.weight, formData.height]);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const genderOptions = ["Male", "Female", "Other"];
  const yesNoOptions = ["Yes", "No"];

  const steps = [
    { id: "sectionA", title: "Section A", subtitle: "Research Details" },
    { id: "sectionB", title: "Section B", subtitle: "Data Collection Purpose" },
    { id: "sectionC", title: "Section C", subtitle: "Participant Details" },
    { id: "declaration", title: "Declaration", subtitle: "Consent Agreement" },
  ];

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  const validateStep = useCallback(() => {
    const newErrors = {};

    if (currentStep === 2) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.bloodGroup)
        newErrors.bloodGroup = "Blood group is required";
      if (!formData.age || formData.age <= 0)
        newErrors.age = "Valid age is required";
      if (!formData.weight || formData.weight <= 0)
        newErrors.weight = "Valid weight is required";
      if (!formData.height || formData.height <= 0)
        newErrors.height = "Valid height is required";
      if (!formData.hasSugar)
        newErrors.hasSugar = "Please select if you have sugar";
      if (!formData.hasBP) newErrors.hasBP = "Please select if you have BP";
    }

    if (currentStep === 3) {
      if (!formData.agreedToConsent) {
        newErrors.agreedToConsent = "You must agree to the consent to proceed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData]);

  // const handleNext = useCallback(async () => {
  //   if (validateStep()) {
  //     if (currentStep < steps.length - 1) {
  //       setCurrentStep((prev) => prev + 1);
  //     } else {
  //       if (!user || submitting) return;

  //       try {
  //         setSubmitting(true);

  //         const userRef = ref(database, `users/${user.uid}`);

  //         await update(userRef, {
  //           consentAccepted: true,
  //           consentAt: Date.now(),
  //         });
  //         localStorage.setItem("consent_completed", "true");
  //         await set(ref(database, `users/${user.uid}/consentForm`), {
  //           ...formData,
  //           bmi,
  //           submittedAt: Date.now(),
  //         });

  //         toast.success("Consent submitted successfully! 🎉");
  //         navigate("/Monitoring", { replace: true });
  //         // setTimeout(() => {
  //         //   navigate("/Monitoring", { replace: true });
  //         // }, 800);
  //       } catch (error) {
  //         console.error(error);
  //         toast.error("Something went wrong. Please try again.");
  //       } finally {
  //         setSubmitting(false);
  //       }
  //     }
  //   }
  // }, [
  //   currentStep,
  //   validateStep,
  //   formData,
  //   steps.length,
  //   user,
  //   bmi,
  //   navigate,
  //   submitting,
  // ]);

  const handleNext = useCallback(async () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        if (!user || submitting) return;

        try {
          setSubmitting(true);

          const userRef = ref(database, `users/${user.uid}`);

          // 🔥 1. Update Firebase
          await update(userRef, {
            consentAccepted: true,
            consentAt: Date.now(),
          });

          await set(ref(database, `users/${user.uid}/consentForm`), {
            ...formData,
            bmi,
            submittedAt: Date.now(),
          });

          toast.success("Consent submitted successfully! 🎉");

          // 🔥 2. IMMEDIATELY UPDATE LOCAL STATE (Bypass ProtectedRoute delay)
          localStorage.setItem("consent_completed", "true");

          // 🔥 3. Force ProtectedRoute re-check with small delay
          setTimeout(() => {
            window.location.href = "/Monitoring"; // Hard refresh = Guaranteed state update
          }, 500);
        } catch (error) {
          console.error(error);
          toast.error("Something went wrong. Please try again.");
        } finally {
          setSubmitting(false);
        }
      }
    }
  }, [
    currentStep,
    validateStep,
    formData,
    steps.length,
    user,
    bmi,
    navigate,
    submitting,
  ]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const renderSectionA = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Details of Research Members
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Research Scholar:</span>
              <p className="mt-1">Dileep Kumar</p>
            </div>
            <div>
              <span className="font-medium">Research Area:</span>
              <p className="mt-1">
                Non-Invasive Blood Glucose Measurement and Management
              </p>
            </div>
            <div>
              <span className="font-medium">Affiliated Programme:</span>
              <p className="mt-1">PhD</p>
            </div>
            <div>
              <span className="font-medium">Research Supervisors:</span>
              <p className="mt-1">Dr. N. P. Singh (Assoc. Prof.)</p>
              <p>Dr. Gaurav Verma (Asst. Prof.)</p>
            </div>
            <div>
              <span className="font-medium">Department:</span>
              <p className="mt-1">Electronics and Communication Engineering</p>
            </div>
            <div>
              <span className="font-medium">Organization:</span>
              <p className="mt-1">
                NIT Kurukshetra, Kurukshetra, Haryana-136119, India
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionB = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Purpose of Data Collection
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          The collected data will be used exclusively for research purposes,
          specifically to:
        </p>
        <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700 ml-2">
          <li>
            Evaluate the effectiveness and accuracy of non-invasive blood
            glucose measurement technologies.
          </li>
          <li>
            Investigate the feasibility of using these technologies for blood
            glucose management.
          </li>
          <li>
            Identify potential correlations between physiological parameters and
            blood glucose levels.
          </li>
        </ol>
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="font-semibold text-sm text-gray-900 mb-2">
            Note: Data Protection and Confidentiality
          </p>
          <p className="text-sm text-gray-700">
            Data will be stored securely and confidentially. All identified
            information will be anonymized and coded to protect participant
            privacy. Data will not be shared with third parties without
            participant explicit consent.
          </p>
        </div>
      </div>
    </div>
  );

  const renderSectionC = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Details of Research Participant (Subject)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-4 focus:outline-none  py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className={`w-full focus:outline-none px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                errors.gender ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Gender</option>
              {genderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
            )}
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Group <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
              className={`w-full focus:outline-none px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                errors.bloodGroup ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            {errors.bloodGroup && (
              <p className="mt-1 text-sm text-red-500">{errors.bloodGroup}</p>
            )}
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              className={`w-full focus:outline-none  px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                errors.age ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter age"
              min="1"
            />
            {errors.age && (
              <p className="mt-1 text-sm text-red-500">{errors.age}</p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (Kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => handleInputChange("weight", e.target.value)}
              className={`w-full focus:outline-none  px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                errors.weight ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter weight in kg"
              step="0.1"
              min="0"
            />
            {errors.weight && (
              <p className="mt-1 text-sm text-red-500">{errors.weight}</p>
            )}
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height (cm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => handleInputChange("height", e.target.value)}
              className={`w-full focus:outline-none  px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                errors.height ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter height in cm"
              step="0.1"
              min="0"
            />
            {errors.height && (
              <p className="mt-1 text-sm text-red-500">{errors.height}</p>
            )}
          </div>

          {/* BMI (Auto-calculated) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              BMI (Auto-calculated)
            </label>
            <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
              {bmi || "Enter weight and height to calculate"}
            </div>
          </div>

          {/* Health History - Sugar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Health History: Sugar <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.hasSugar}
              onChange={(e) => handleInputChange("hasSugar", e.target.value)}
              className={`w-full focus:outline-none px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                errors.hasSugar ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select</option>
              {yesNoOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.hasSugar && (
              <p className="mt-1 text-sm text-red-500">{errors.hasSugar}</p>
            )}
          </div>

          {/* Health History - BP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Health History: BP <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.hasBP}
              onChange={(e) => handleInputChange("hasBP", e.target.value)}
              className={`w-full focus:outline-none  px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                errors.hasBP ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select</option>
              {yesNoOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.hasBP && (
              <p className="mt-1 text-sm text-red-500">{errors.hasBP}</p>
            )}
          </div>

          {/* Other Conditions */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Health Conditions
            </label>
            <input
              type="text"
              value={formData.otherConditions}
              readOnly
              onChange={(e) =>
                handleInputChange("otherConditions", e.target.value)
              }
              className="cursor-not-allowed w-full focus:outline-none  px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Admin will fill any other health conditions"
            />
          </div>

          {/* Sugar Level by Invasive Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sugar Level (mg/dL)
            </label>
            <input
              type="text"
              value={formData.sugarLevel}
              readOnly
              onChange={(e) => handleInputChange("sugarLevel", e.target.value)}
              className="cursor-not-allowed w-full focus:outline-none  px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Admin will fill sugar level"
            />
          </div>

          {/* Pulse/Heart Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pulse/Heart Rate
            </label>
            <input
              type="text"
              value={formData.pulseRate}
              readOnly
              onChange={(e) => handleInputChange("pulseRate", e.target.value)}
              className="cursor-not-allowed w-full px-4 focus:outline-none  py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Admin will fill pulse rate"
            />
          </div>

          {/* SpO2 Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SpO2 Level
            </label>
            <input
              type="text"
              value={formData.spO2Level}
              readOnly
              onChange={(e) => handleInputChange("spO2Level", e.target.value)}
              className="cursor-not-allowed w-full px-4 focus:outline-none  py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Admin will fill SpO2 level"
            />
          </div>

          {/* Blood Pressure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Pressure (BP)
            </label>
            <input
              type="text"
              value={formData.bloodPressure}
              readOnly
              onChange={(e) =>
                handleInputChange("bloodPressure", e.target.value)
              }
              className="cursor-not-allowed w-full focus:outline-none  px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Admin will fill blood pressure"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeclaration = () => (
    <div className="space-y-6">
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Declaration by Participant
        </h3>
        <div className="bg-white p-6 rounded-lg border border-indigo-200">
          <p className="text-sm text-gray-700 leading-relaxed mb-6">
            I hereby voluntarily declare that I have been informed, read and
            understood the nature and purpose of the research study on{" "}
            <span className="font-semibold">
              Non-Invasive Blood Glucose Measurement and Management
            </span>
            . I acknowledge to provide my consent for the collection, storage,
            and use of my data for this research only.
          </p>

          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="consent"
              checked={formData.agreedToConsent}
              onChange={(e) =>
                handleInputChange("agreedToConsent", e.target.checked)
              }
              className="mt-1 h-5 w-5 text-indigo-600 border-gray-300 rounded"
            />
            <label
              htmlFor="consent"
              className="text-sm text-gray-700 cursor-pointer select-none"
            >
              <span className="font-semibold">
                I agree to the terms and conditions stated above
              </span>
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          {errors.agreedToConsent && (
            <p className="mt-2 text-sm text-red-500">
              {errors.agreedToConsent}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderSectionA();
      case 1:
        return renderSectionB();
      case 2:
        return renderSectionC();
      case 3:
        return renderDeclaration();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Consent for Research Participation
          </h1>
          <p className="text-gray-600">NIT Kurukshetra - Research Study</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      index === currentStep
                        ? "bg-indigo-600 text-white scale-110 shadow-lg"
                        : index < currentStep
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-2 text-center hidden sm:block">
                    <p
                      className={`text-sm font-medium ${
                        index === currentStep
                          ? "text-indigo-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400">{step.subtitle}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all duration-300 ${
                      index < currentStep ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Current Step Title (Mobile) */}
        <div className="sm:hidden mb-4 text-center">
          <p className="text-lg font-medium text-indigo-600">
            {steps[currentStep].title}
          </p>
          <p className="text-sm text-gray-500">{steps[currentStep].subtitle}</p>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg"
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          {/* <button
            onClick={handleNext}
            className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
          >
            {currentStep === steps.length - 1 ? "Submit" : "Next"}
            {currentStep < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 ml-2" />
            )}
          </button> */}
          <button
            onClick={handleNext}
            disabled={submitting}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200
    ${
      submitting
        ? "bg-indigo-400 cursor-not-allowed"
        : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
    }
    text-white`}
          >
            {currentStep === steps.length - 1
              ? submitting
                ? "Submitting..."
                : "Submit"
              : "Next"}

            {currentStep < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 ml-2" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentForm;
