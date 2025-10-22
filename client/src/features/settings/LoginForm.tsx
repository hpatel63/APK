import { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from './authSlice';
import { AppDispatch, RootState } from '../../store/store';

const LoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector((state: RootState) => state.auth.status);
  const [username, setUsername] = useState('manager');
  const [password, setPassword] = useState('Manager@123');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await dispatch(login({ username, password })).unwrap();
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Unable to login');
    }
  };

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-md rounded-3xl bg-aurora-glass border border-white/10 backdrop-blur-2xl p-8 space-y-4 shadow-2xl"
    >
      <div>
        <h1 className="text-2xl font-semibold">Aurora POS Login</h1>
        <p className="text-white/60">Enter demo credentials to continue.</p>
      </div>
      <input
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="Username"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3"
      />
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3"
      />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full px-4 py-3 rounded-lg bg-aurora-neon/20 border border-aurora-neon text-aurora-neon disabled:opacity-60"
      >
        {status === 'loading' ? 'Signing in…' : 'Sign In'}
      </button>
      <p className="text-xs text-white/50">Manager: manager / Manager@123</p>
      <p className="text-xs text-white/50">Associate: associate / Associate@123</p>
    </form>
  );
};

export default LoginForm;
