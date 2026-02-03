import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isLogin = params.get('type') === 'login';
  const userType = (params.get('role') as 'painter' | 'customer') || 'customer';

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [postcode, setPostcode] = useState('');

  // Validation schema
  const ukPostcode = /^(?:[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2})$/i;

  const loginSchema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(1, 'Enter your password'),
  });

  const signupSchema = z
    .object({
      email: z.string().email('Enter a valid email'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string().min(6, 'Confirm your password'),
      postcode:
        userType === 'painter'
          ? z.string().regex(ukPostcode, 'Use UK format e.g. M1 1AE')
          : z.string().optional(),
    })
    .refine((v) => v.password === v.confirmPassword, {
      message: 'Passwords must match',
      path: ['confirmPassword'],
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (isLogin) {
        // Login
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          const newErrors: Record<string, string> = {};
          result.error.issues.forEach((issue) => {
            newErrors[issue.path[0] as string] = issue.message;
          });
          setErrors(newErrors);
          return;
        }

        setIsLoading(true);
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrors({
            form: data.error || 'Login failed. Please try again.',
          });
          toast.error('Login failed');
          return;
        }

        // Store token and user
        localStorage.setItem('paintbook:token', data.token);
        localStorage.setItem('paintbook:user', JSON.stringify(data.user));

        toast.success('Welcome back!');

        // Redirect based on user type
        if (data.user.userType === 'painter') {
          navigate('/painter-dashboard');
        } else {
          navigate('/customer-dashboard');
        }
      } else {
        // Signup
        const result = signupSchema.safeParse({
          email,
          password,
          confirmPassword,
          postcode,
        });

        if (!result.success) {
          const newErrors: Record<string, string> = {};
          result.error.issues.forEach((issue) => {
            newErrors[issue.path[0] as string] = issue.message;
          });
          setErrors(newErrors);
          return;
        }

        setIsLoading(true);
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            userType,
            postcode: userType === 'painter' ? postcode : undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrors({
            email:
              data.error === 'Email already in use'
                ? 'This email is already registered'
                : data.error || 'Signup failed',
          });
          toast.error('Signup failed');
          return;
        }

        // Store token and user
        localStorage.setItem('paintbook:token', data.token);
        localStorage.setItem('paintbook:user', JSON.stringify(data.user));

        toast.success(
          userType === 'painter'
            ? 'Welcome to PaintBookco! Let\'s verify your account.'
            : 'Account created successfully!'
        );

        // Redirect based on user type
        if (userType === 'painter') {
          navigate('/painter-onboarding');
        } else {
          navigate('/customer-dashboard');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({
        form: 'Something went wrong. Please try again.',
      });
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">
            {isLogin
              ? userType === 'painter'
                ? 'Sign in as Painter'
                : 'Sign in to your account'
              : userType === 'painter'
              ? 'Join as a Painter'
              : 'Create account'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Welcome back! Sign in to continue.'
              : userType === 'painter'
              ? 'Get started with PaintBookco. No subscription required.'
              : 'Create a customer account to post painting jobs.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errors.form && (
            <div className="mb-4 flex gap-2 rounded-lg bg-red-50 p-3 border border-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-900">{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="mt-1 flex items-center text-sm text-red-500">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                disabled={isLoading}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="mt-1 flex items-center text-sm text-red-500">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password (Signup only) */}
            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  disabled={isLoading}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 flex items-center text-sm text-red-500">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Postcode (Painters only) */}
            {!isLogin && userType === 'painter' && (
              <div>
                <Label htmlFor="postcode">Work postcode</Label>
                <Input
                  id="postcode"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="e.g. M1 1AE"
                  disabled={isLoading}
                  className={errors.postcode ? 'border-red-500' : ''}
                />
                {errors.postcode && (
                  <p className="mt-1 flex items-center text-sm text-red-500">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {errors.postcode}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  We'll use this to match you with nearby jobs
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {/* Toggle Link */}
            <div className="text-center text-sm">
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <a
                    href={`/auth?role=${userType}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    Sign up
                  </a>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <a
                    href={`/auth?type=login&role=${userType}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    Sign in
                  </a>
                </>
              )}
            </div>

            {/* Role Switch */}
            <div className="pt-4 border-t text-center text-sm">
              {userType === 'painter' ? (
                <>
                  Looking to post a job?{' '}
                  <a
                    href="/auth?role=customer"
                    className="font-semibold text-primary hover:underline"
                  >
                    Sign up as customer
                  </a>
                </>
              ) : (
                <>
                  Looking to get painting jobs?{' '}
                  <a
                    href="/auth?role=painter"
                    className="font-semibold text-primary hover:underline"
                  >
                    Join as painter
                  </a>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
