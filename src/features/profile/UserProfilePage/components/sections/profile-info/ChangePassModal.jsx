import React from "react";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
	ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import api from "@/lib/api";

const getResponseMessage = (response, fallback) =>
	response?.data?.message || response?.message || fallback;

const ChangePassModal = ({ open, onOpenChange }) => {
	const [isSaving, setIsSaving] = React.useState(false);
	const [formValues, setFormValues] = React.useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
	const [showNewPassword, setShowNewPassword] = React.useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);


	React.useEffect(() => {
		if (!open) {
			setFormValues({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
			setIsSaving(false);
			setShowCurrentPassword(false);
			setShowNewPassword(false);
			setShowConfirmPassword(false);
		}
	}, [open]);

	const handleInputChange = (key) => (event) => {
		setFormValues((previous) => ({ ...previous, [key]: event.target.value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (
			!formValues.currentPassword ||
			!formValues.newPassword ||
			!formValues.confirmPassword
		) {
			toast.error("Please fill in all fields");
			return;
		}
		if (formValues.newPassword !== formValues.confirmPassword) {
			toast.error("New password and confirmation do not match");
			return;
		}
		if (formValues.currentPassword === formValues.newPassword) {
			toast.error("New password must be different from current password");
			return;
		}

		setIsSaving(true);
		try {
			const response = await api.post("/auth/change-password", {
				currentPassword: formValues.currentPassword,
				newPassword: formValues.newPassword,
			});
			toast.success(
				getResponseMessage(response?.data, "Password updated successfully")
			);
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error?.response?.data?.message ||
					error?.message ||
					"Failed to update password"
			);
		} finally {
			setIsSaving(false);
		}
	};

	const handleClose = (nextOpen) => {
		if (!isSaving) {
			onOpenChange(nextOpen);
		}
	};

	return (
		<Modal open={open} onOpenChange={handleClose}>
			<ModalContent className="max-w-[340px] lg:max-w-[330px] xl:max-w-[441px] 2xl:max-w-[496px] 3xl:max-w-[620px] p-0 overflow-hidden gap-0 rounded-2xl">
				<div className="relative p-4 lg:p-4.5 xl:p-5.5 2xl:p-6.5 3xl:p-8">
					<ModalHeader className="mb-2 lg:mb-3 xl:mb-4 2xl:mb-5 3xl:mb-6 p-0">
						<ModalTitle className="text-sm lg:text-[13px] xl:text-[17px] 2xl:text-[19px] 3xl:text-2xl font-bold text-center">
							Change password
						</ModalTitle>
					</ModalHeader>

					<form
						onSubmit={handleSubmit}
						className="space-y-3 lg:space-y-2.5 xl:space-y-3 2xl:space-y-3.5 3xl:space-y-4"
					>
						<div className="flex flex-col gap-1">
							<label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-normal text-lighter-text">
								Current password
							</label>
							<Input
								type={showCurrentPassword ? "text" : "password"}
								value={formValues.currentPassword}
								onChange={handleInputChange("currentPassword")}
								placeholder="Enter current password"
								rightIcon={
									<button
										type="button"
										onClick={() =>
											setShowCurrentPassword((prev) => !prev)
										}
										className="text-base-color"
										aria-label={
											showCurrentPassword
												? "Hide current password"
												: "Show current password"
										}
									>
										{showCurrentPassword ? (
											<Eye className="h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4" />
										) : (
											<EyeOff className="h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4" />
										)}
									</button>
								}
								variant="default"
              					className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs"
              					inputClassName="placeholder:text-xs lg:placeholder:text-[7px] xl:placeholder:text-[8px] 2xl:placeholder:text-[10px] 3xl:placeholder:text-xs"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-normal text-lighter-text">
								New password
							</label>
							<Input
								type={showNewPassword ? "text" : "password"}
								value={formValues.newPassword}
								onChange={handleInputChange("newPassword")}
								placeholder="Enter new password"
								rightIcon={
									<button
										type="button"
										onClick={() =>
											setShowNewPassword((prev) => !prev)
										}
										className="text-base-color"
										aria-label={
											showNewPassword
												? "Hide new password"
												: "Show new password"
										}
									>
										{showNewPassword ? (
											<Eye className="h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4" />
										) : (
											<EyeOff className="h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4" />
										)}
									</button>
								}
								variant="default"
              					className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs"
              					inputClassName="placeholder:text-xs lg:placeholder:text-[7px] xl:placeholder:text-[8px] 2xl:placeholder:text-[10px] 3xl:placeholder:text-xs"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-normal text-lighter-text">
								Confirm password
							</label>
							<Input
								type={showConfirmPassword ? "text" : "password"}
								value={formValues.confirmPassword}
								onChange={handleInputChange("confirmPassword")}
								placeholder="Re-enter new password"
								rightIcon={
									<button
										type="button"
										onClick={() =>
											setShowConfirmPassword((prev) => !prev)
										}
										className="text-base-color"
										aria-label={
											showConfirmPassword
												? "Hide confirm password"
												: "Show confirm password"
										}
									>
										{showConfirmPassword ? (
											<Eye className="h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4" />
										) : (
											<EyeOff className="h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4" />
										)}
									</button>
								}
								variant="default"
              					className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs"
              					inputClassName="placeholder:text-xs lg:placeholder:text-[7px] xl:placeholder:text-[8px] 2xl:placeholder:text-[10px] 3xl:placeholder:text-xs"
							/>
						</div>

						<ModalFooter className="flex-row gap-5 lg:gap-2 xl:gap-3 2xl:gap-4 3xl:gap-5 mt-6 lg:mt-3 xl:mt-4 2xl:mt-5 3xl:mt-6 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs sm:justify-between h-9 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9">
							<Button
								onClick={() => handleClose(false)}
								disabled={isSaving}
								intent="outline"
								className="w-full border-table-stroke sm:w-1/2 text-base-color "
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSaving}
								className="w-full text-white sm:w-1/2 bg-primary hover:bg-primary/90"
							>
								{isSaving && <Loader2 className="h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 animate-spin" />}
								Update
							</Button>
						</ModalFooter>
					</form>
				</div>
			</ModalContent>
		</Modal>
	);
};

export default ChangePassModal;
