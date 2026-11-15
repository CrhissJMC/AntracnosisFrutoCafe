// Perfiles y permisos del módulo de diagnóstico (la API y la base de datos los vuelven a comprobar).

export const PROFILES = [
  { id: 'productor', label: 'Productor' },
  { id: 'propietario', label: 'Propietario' },
  { id: 'especialista', label: 'Especialista' },
];
export const profileLabel = (id) => PROFILES.find((p) => p.id === id)?.label ?? 'Sin perfil';

/** Valida como especialista si tiene ese perfil; si no, como administrador. */
export function validatorProfile(user) {
  if (user?.perfil === 'especialista') return 'especialista';
  if (user?.role === 'admin') return 'admin';
  return null;
}
export const canValidate = (user) => Boolean(validatorProfile(user));

/** Clases que puede confirmar el especialista. «Otro daño» registra lo que no es antracnosis (p. ej., broca). */
export const VALIDATION_CLASSES = [
  { id: 'sano', label: 'Sano' },
  { id: 'antracnosis', label: 'Antracnosis' },
  { id: 'otro_dano', label: 'Otro daño' },
];
export const validationLabel = (id) => VALIDATION_CLASSES.find((c) => c.id === id)?.label ?? id;
export const validatorLabel = (perfil) => (perfil === 'admin' ? 'Administrador' : 'Especialista');

export const MODEL_NAMES = { efficientnet_b0: 'EfficientNet-B0', mobilenet_v2: 'MobileNetV2' };
export const classTone = (c) => (c === 'antracnosis' ? 'brand' : c === 'sano' ? 'success' : 'warning');
export const captureImageUrl = (id) => `/api/diagnostico/capturas/${id}/imagen`;

/** Historial: el propietario, el especialista y el administrador ven todas las capturas; el resto, las suyas. */
export const seesAllCaptures = (user) => Boolean(user && (user.role === 'admin' || ['propietario', 'especialista'].includes(user.perfil)));

/** Pestañas del módulo; cada usuario ve solo las de su perfil. */
export function moduleTabs(user) {
  const tabs = [{ to: '/diagnostico', label: 'Nuevo diagnóstico', icon: 'scan' }];
  if (user) tabs.push({ to: '/historial', label: 'Historial', icon: 'clock' });
  if (canValidate(user)) tabs.push({ to: '/validacion', label: 'Validación', icon: 'check' });
  if (seesAllCaptures(user)) tabs.push({ to: '/tablero', label: 'Tablero', icon: 'chart' });
  return tabs;
}
