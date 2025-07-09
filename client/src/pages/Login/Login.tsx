import React, { useState } from 'react';
import { FaBriefcase, FaBalanceScale, FaEye, FaEyeSlash, FaGoogle, FaMicrosoft, FaGithub, FaUserMd, FaGraduationCap, FaUsers } from 'react-icons/fa';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const MODES = [
	{ label: 'Bridgelayer', value: 'bridgelayer', icon: <FaBriefcase className="inline mr-1" /> },
	{ label: 'Tenant Login', value: 'tenant', icon: <FaBalanceScale className="inline mr-1" /> },
];

const VERTICALS = [
	{ label: 'FirmSync (Legal)', value: 'legal', icon: <FaBalanceScale className="inline mr-1" /> },
	{ label: 'MedSync (Medical)', value: 'medical', icon: <FaUserMd className="inline mr-1" /> },
	{ label: 'EduSync (Education)', value: 'education', icon: <FaGraduationCap className="inline mr-1" /> },
	{ label: 'HRSync (Human Resources)', value: 'hr', icon: <FaUsers className="inline mr-1" /> },
];

const OAUTH_PROVIDERS = [
	{ id: 'google', label: 'Google', icon: FaGoogle },
	{ id: 'microsoft', label: 'Microsoft', icon: FaMicrosoft },
	{ id: 'github', label: 'GitHub', icon: FaGithub },
] as const;

const Login: React.FC = () => {
	const [mode, setMode] = useState('bridgelayer');
	const [vertical, setVertical] = useState('legal');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [remember, setRemember] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<{
		email?: string;
		password?: string;
		general?: string;
	}>({});

	const { login, oauthLogin } = useAuth();

	const validateForm = (): boolean => {
		const newErrors: typeof errors = {};

		if (!email) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = 'Invalid email format';
		}

		if (!password) {
			newErrors.password = 'Password is required';
		} else if (password.length < 8) {
			newErrors.password = 'Password must be at least 8 characters';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);
		setErrors({});

		try {
			await login(email, password, mode as 'bridgelayer' | 'firm', undefined, vertical);
			toast.success('Welcome back!');
		} catch (err: any) {
			const message =
				err.code === 'INVALID_CREDENTIALS'
					? 'Invalid email or password'
					: err.message || 'Login failed';

			setErrors({ general: message });
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	const handleOAuthLogin = async (provider: 'google' | 'microsoft' | 'github') => {
		try {
			await oauthLogin(provider);
		} catch (err: any) {
			toast.error(err.message || `${provider} login failed`);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
			<div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 relative">
				{/* Logo & Tagline */}
				<div className="flex flex-col items-center mb-6">
					<div className="mb-2">
						{mode === 'bridgelayer' ? (
							<FaBriefcase className="text-blue-700" size={40} />
						) : (
							<FaBalanceScale className="text-purple-600" size={40} />
						)}
					</div>
					<h1 className="text-xl font-bold text-gray-800 mb-1">
						{mode === 'bridgelayer' ? 'BridgeLayer Platform' : 'FirmSync Legal'}
					</h1>
					<span className="text-gray-500 text-sm">
						{mode === 'bridgelayer'
							? 'Platform Administration & Management'
							: 'Law Firm Access Portal'}
					</span>
				</div>

				{/* Mode Toggle */}
				<div className="flex rounded-lg bg-gray-100 p-1 mb-4">
					{MODES.map(({ label, value, icon }) => (
						<button
							key={value}
							onClick={() => setMode(value)}
							className={cn(
								'flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all',
								mode === value
									? 'bg-white shadow text-blue-700'
									: 'text-gray-500 hover:text-gray-700'
							)}
						>
							{icon}
							{label}
						</button>
					))}
				</div>

				{/* Vertical Selection for Tenant Mode */}
				{mode === 'tenant' && (
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Select Your Industry
						</label>
						<div className="grid grid-cols-2 gap-2">
							{VERTICALS.map(({ label, value, icon }) => (
								<button
									key={value}
									type="button"
									onClick={() => setVertical(value)}
									className={cn(
										'flex items-center justify-center px-3 py-2 rounded-md text-xs font-medium transition-all border',
										vertical === value
											? 'bg-blue-50 border-blue-200 text-blue-700'
											: 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
									)}
								>
									{icon}
									{label}
								</button>
							))}
						</div>
					</div>
				)}

				{errors.general && (
					<div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm">
						{errors.general}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Input
							type="email"
							placeholder="Email address"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className={cn(errors.email && 'border-red-500')}
							disabled={loading}
						/>
						{errors.email && (
							<p className="mt-1 text-xs text-red-500">{errors.email}</p>
						)}
					</div>

					<div className="relative">
						<Input
							type={showPassword ? 'text' : 'password'}
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className={cn(errors.password && 'border-red-500')}
							disabled={loading}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
						>
							{showPassword ? <FaEyeSlash /> : <FaEye />}
						</button>
						{errors.password && (
							<p className="mt-1 text-xs text-red-500">{errors.password}</p>
						)}
					</div>

					<div className="flex items-center justify-between">
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={remember}
								onChange={(e) => setRemember(e.target.checked)}
								className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
							/>
							<span className="ml-2 text-sm text-gray-600">Remember me</span>
						</label>
						<a
							href="/forgot-password"
							className="text-sm text-blue-600 hover:text-blue-800"
						>
							Forgot password?
						</a>
					</div>

					<Button
						type="submit"
						className="w-full bg-blue-600 hover:bg-blue-700 text-white"
						disabled={loading}
					>
						{loading ? (
							<span className="flex items-center justify-center">
								<svg
									className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Signing in...
							</span>
						) : (
							'Sign in'
						)}
					</Button>

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-white text-gray-500">
								Or continue with
							</span>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-3">
						{OAUTH_PROVIDERS.map(({ id, label, icon: Icon }) => (
							<Button
								key={id}
								type="button"
								variant="outline"
								onClick={() =>
									handleOAuthLogin(id as 'google' | 'microsoft' | 'github')
								}
								disabled={loading}
								className="w-full"
							>
								<Icon className="w-5 h-5" />
								<span className="sr-only">Sign in with {label}</span>
							</Button>
						))}
					</div>
				</form>

				{mode === 'firm' && (
					<p className="mt-6 text-center text-sm text-gray-500">
						New to FirmSync?{' '}
						<a
							href="/onboarding"
							className="text-blue-600 hover:text-blue-800"
						>
							Set up your firm account
						</a>
					</p>
				)}
			</div>
		</div>
	);
};

export default Login;
