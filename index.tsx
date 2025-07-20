import React, { useState, useEffect, useCallback, FC } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- ТИПОВЕ ---
interface User {
  username: string;
  password: string; // В реално приложение, това ще бъде хеш
  email: string;
  phone: string;
  fullName: string;
  isConfirmed: boolean;
}

interface Car {
  make: string;
  model: string;
  year: number;
  mileage: number;
  vin: string;
  imageUrl: string | null;
}

interface ServiceRecord {
  id: string;
  date: string;
  mileage: number;
  category: string;
  type: string;
  cost: number;
  serviceStation: string;
  notes: string;
}

interface AIAdviceResponse {
  estimatedCost: string;
  nextServiceSuggestion: string;
  additionalTips: string[];
}

interface AIDiagnosis {
    possibleCause: string;
    estimatedCost: string;
    complexity: string;
}

interface AIDiagnosisResponse {
    analysis: AIDiagnosis[];
    recommendation: string;
}

type View = 'dashboard' | 'car_profile' | 'diagnostics';


// --- API КЛЮЧ И ИНИЦИАЛИЗАЦИЯ ---
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY не е дефиниран. AI функционалността няма да работи.");
}
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;


// =================================================================
// --- УСЛУГИ (СИМУЛИРАН БЕКЕНД) ---
// =================================================================

const authService = {
  getCurrentUser: (): User | null => {
    const userJson = sessionStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  },
  login: (identifier: string, password: string): User | null => {
    const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
    const user = users.find(u => (u.username === identifier || u.email === identifier) && u.password === password);
    if (!user) return null;
    if (!user.isConfirmed) throw new Error("Акаунтът не е потвърден. Моля, проверете имейла си.");
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  },
  register: (data: Omit<User, 'isConfirmed'>): User => {
    const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
    if (users.some(u => u.username === data.username)) {
      throw new Error("Потребителското име е заето.");
    }
    if (users.some(u => u.email === data.email)) {
      throw new Error("Имейл адресът вече е регистриран.");
    }
    const newUser: User = { ...data, isConfirmed: false };
    users.push(newUser);
    localStorage.setItem('app_users', JSON.stringify(users));
    // Не логваме потребителя веднага
    return newUser;
  },
  logout: () => {
    sessionStorage.removeItem('currentUser');
  },
  confirmUser: (username: string): boolean => {
      const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
      const userIndex = users.findIndex(u => u.username === username);
      if (userIndex > -1) {
          users[userIndex].isConfirmed = true;
          localStorage.setItem('app_users', JSON.stringify(users));
          return true;
      }
      return false;
  },
  updateUser: (username: string, data: Partial<User>): User => {
      const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
      const userIndex = users.findIndex(u => u.username === username);
      if (userIndex === -1) throw new Error("Потребителят не е намерен.");
      
      const updatedUser = { ...users[userIndex], ...data };
      users[userIndex] = updatedUser;
      
      localStorage.setItem('app_users', JSON.stringify(users));
      sessionStorage.setItem('currentUser', JSON.stringify(updatedUser)); // Актуализираме и сесията
      return updatedUser;
  }
};

const dataService = {
  getCar: (username: string): Car => {
    const carJson = localStorage.getItem(`car_${username}`);
    return carJson ? JSON.parse(carJson) : { make: '', model: '', year: new Date().getFullYear(), mileage: 0, vin: '', imageUrl: null };
  },
  getServices: (username: string): ServiceRecord[] => {
    const servicesJson = localStorage.getItem(`services_${username}`);
    return servicesJson ? JSON.parse(servicesJson) : [];
  },
  saveData: (username: string, car: Car, services: ServiceRecord[]) => {
    localStorage.setItem(`car_${username}`, JSON.stringify(car));
    localStorage.setItem(`services_${username}`, JSON.stringify(services));
  }
};

const apiService = {
  getAIAdvice: async (car: Car, serviceType: string): Promise<AIAdviceResponse> => {
    if (!ai) throw new Error('AI услугата не е достъпна.');
    
    const schema = {
        type: Type.OBJECT,
        properties: {
          estimatedCost: { type: Type.STRING, description: 'Примерна цена в български лева (BGN).' },
          nextServiceSuggestion: { type: Type.STRING, description: 'Препоръка за следващо обслужване в километри.' },
          additionalTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Допълнителни съвети.' },
        },
        required: ["estimatedCost", "nextServiceSuggestion", "additionalTips"]
      };

    const prompt = `Ти си експертен автомобилен механик и асистент за собственици на коли в България. Потребителят има следния автомобил: ${car.make} ${car.model}, ${car.year} г. с настоящ пробег ${car.mileage} км. Той въвежда следното обслужване: "${serviceType}". Предостави JSON с 'estimatedCost', 'nextServiceSuggestion' и 'additionalTips' на български.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text.trim());
  },

  getAIDiagnosis: async (car: Car, problemDescription: string): Promise<AIDiagnosisResponse> => {
    if (!ai) throw new Error('AI услугата не е достъпна.');
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            analysis: {
                type: Type.ARRAY,
                description: "Списък от 2-3 възможни причини за проблема.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        possibleCause: { type: Type.STRING, description: "Конкретна възможна причина." },
                        estimatedCost: { type: Type.STRING, description: "Прогнозен ценови диапазон за ремонт в BGN (напр. '100 - 200 лв.')." },
                        complexity: { type: Type.STRING, description: "Сложност на ремонта (Ниска, Средна, Висока)." },
                    },
                    required: ["possibleCause", "estimatedCost", "complexity"]
                }
            },
            recommendation: { type: Type.STRING, description: "Финална препоръка какво да направи потребителят (напр. 'Посетете сервиз за точна диагностика')." }
        },
        required: ["analysis", "recommendation"]
    };

    const prompt = `Ти си топ автомобилен диагностик за България. Потребител има ${car.make} ${car.model} (${car.year} г.) и описва следния проблем: "${problemDescription}". Направи анализ и предостави JSON обект на български език, който съдържа: 1. 'analysis' - масив от обекти, всеки с 'possibleCause', 'estimatedCost', 'complexity'. 2. 'recommendation' - твоята финална препоръка.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text.trim());
  }
};


// =================================================================
// --- КОМПОНЕНТИ ---
// =================================================================

const Logo: FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => (
    <div className="logo-container">
        <svg className="logo-svg" viewBox="0 0 50 40" xmlns="http://www.w3.org/2000/svg">
             <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: 'var(--primary-hover)', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: 'var(--primary)', stopOpacity: 1}} />
                </linearGradient>
            </defs>
            <path d="M 20 5 L 0 35 L 10 35 L 25 12 L 40 35 L 50 35 L 30 5 Z" fill="url(#logo-gradient)"></path>
            <path d="M 45 5 C 38 5 38 35 45 35 L 55 35 L 55 5 Z M 45 10 L 55 10 L 55 15 L 45 15 Z" fill="url(#logo-gradient)" transform="translate(5, 0) scale(0.8)"></path>
        </svg>
        {!isCollapsed && <span className="logo-text">Авто Дневник</span>}
    </div>
);


const AuthScreen: FC<{ onLoginSuccess: (user: User) => void }> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
      username: '', password: '', fullName: '', email: '', phone: '', identifier: ''
  });
  const [error, setError] = useState('');
  const [regSuccessInfo, setRegSuccessInfo] = useState<{username: string, email: string} | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({...prev, [name]: value}));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        const { username, password, email, phone, fullName } = formData;
        if (!username || !password || !email || !fullName) {
          setError("Моля, попълнете всички задължителни полета.");
          return;
        }
        const registeredUser = authService.register({ username, password, email, phone, fullName });
        setRegSuccessInfo({ username: registeredUser.username, email: registeredUser.email });
        setIsRegistering(false);
      } else {
        const user = authService.login(formData.identifier, formData.password);
        if (user) {
          onLoginSuccess(user);
        } else {
          setError('Грешни данни за вход.');
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSimulateConfirm = () => {
      if (regSuccessInfo) {
          authService.confirmUser(regSuccessInfo.username);
          alert(`Акаунтът за ${regSuccessInfo.username} е потвърден. Вече можете да влезете.`);
          setRegSuccessInfo(null);
      }
  }

  const switchMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setRegSuccessInfo(null);
    setFormData({ username: '', password: '', fullName: '', email: '', phone: '', identifier: '' });
  };

  return (
    <div className="auth-layout">
        <div className="auth-graphic-panel">
            <div className="auth-graphic-content">
                <h1>Добре дошли в Авто Дневник</h1>
                <p>Вашият дигитален партньор за управление и поддръжка на автомобила.</p>
            </div>
        </div>
        <div className="auth-form-panel">
            <div className="auth-card">
                 <div className="auth-logo">
                    <span className="material-symbols-outlined icon">directions_car</span>
                    Авто Дневник
                </div>

                {regSuccessInfo ? (
                    <div className="auth-confirmation">
                        <h2>Потвърдете имейла си</h2>
                        <p>Изпратихме линк за потвърждение на <strong>{regSuccessInfo.email}</strong>. Моля, проверете пощата си, за да завършите регистрацията.</p>
                        <div className="simulation-note">
                            <p>Това е демонстрация. Натиснете бутона по-долу, за да симулирате потвърждението на имейла.</p>
                            <button className="btn btn-secondary" onClick={handleSimulateConfirm}>Симулирай потвърждение</button>
                        </div>
                        <p className="auth-toggle">
                            <button onClick={switchMode}>Върни се към вход</button>
                        </p>
                    </div>
                ) : (
                    <>
                        <h2>{isRegistering ? 'Създаване на акаунт' : 'Вход в системата'}</h2>
                        <form onSubmit={handleSubmit}>
                        {error && <p className="auth-error">{error}</p>}
                        {isRegistering ? (
                            <>
                                <div className="form-group"><label>Име*</label><input name="fullName" type="text" value={formData.fullName} onChange={handleChange} required /></div>
                                <div className="form-group"><label>Потребителско име*</label><input name="username" type="text" value={formData.username} onChange={handleChange} required /></div>
                                <div className="form-group"><label>Имейл*</label><input name="email" type="email" value={formData.email} onChange={handleChange} required /></div>
                                <div className="form-group"><label>Телефон</label><input name="phone" type="tel" value={formData.phone} onChange={handleChange} /></div>
                                <div className="form-group"><label>Парола*</label><input name="password" type="password" value={formData.password} onChange={handleChange} required /></div>
                            </>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label>Потребителско име или Имейл</label>
                                    <input name="identifier" type="text" value={formData.identifier} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Парола</label>
                                    <input name="password" type="password" value={formData.password} onChange={handleChange} required />
                                </div>
                            </>
                        )}
                        <button type="submit" className="btn btn-primary btn-block">{isRegistering ? 'Регистрация' : 'Вход'}</button>
                        </form>
                        <p className="auth-toggle">
                        {isRegistering ? 'Вече имате акаунт?' : 'Нямате акаунт?'}
                        <button onClick={switchMode}>
                            {isRegistering ? 'Влезте от тук' : 'Създайте сега'}
                        </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

const Sidebar: FC<{ isCollapsed: boolean, toggleCollapse: () => void, currentView: View, onNavigate: (view: View) => void, user: User, onLogout: () => void, onProfileClick: () => void }> = ({ isCollapsed, toggleCollapse, currentView, onNavigate, user, onLogout, onProfileClick }) => {
    const navItems: { id: View, name: string, icon: string, pro?: boolean }[] = [
        { id: 'dashboard', name: 'Табло', icon: 'dashboard' },
        { id: 'car_profile', name: 'Моят Автомобил', icon: 'directions_car' },
        { id: 'diagnostics', name: 'AI Диагностика', icon: 'build_circle', pro: true },
    ];
    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div>
                <div className="sidebar-header">
                    <Logo isCollapsed={isCollapsed} />
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button key={item.id} title={isCollapsed ? item.name : ''} className={`sidebar-nav-item ${currentView === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
                            <span className="material-symbols-outlined">{item.icon}</span>
                            {!isCollapsed && <span className="nav-item-text">{item.name}</span>}
                            {!isCollapsed && item.pro && <span className="pro-badge">PRO</span>}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="sidebar-footer">
                 <button className="sidebar-nav-item user-profile-button" onClick={onProfileClick}>
                    <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                    {!isCollapsed && (
                        <div className="user-details">
                            <span className="user-greeting">{user.fullName || user.username}</span>
                            <span className="user-action">Настройки на профила</span>
                        </div>
                    )}
                 </button>
                 <button className="sidebar-toggle-btn" onClick={toggleCollapse} title={isCollapsed ? "Разгъни" : "Сгъни"}>
                    <span className="material-symbols-outlined">{isCollapsed ? 'menu_open' : 'menu'}</span>
                 </button>
            </div>
        </aside>
    );
}

const ServiceHistory: FC<{ services: ServiceRecord[] }> = ({ services }) => (
    <section className="card" aria-labelledby="history-title">
      <h2 className="card-title" id="history-title">
        <span className="material-symbols-outlined">history</span>
        История на обслужванията
      </h2>
      <div className="service-history-list">
        {services.length > 0 ? (
          services
            .slice()
            .sort((a, b) => b.mileage - a.mileage)
            .map(service => (
              <article key={service.id} className="service-record">
                <div className="service-record-header">
                    <h3>{service.type}</h3>
                    <span className="service-category">{service.category}</span>
                </div>
                <div className="service-record-body">
                  <p><strong>Дата:</strong> {new Date(service.date).toLocaleDateString('bg-BG')}</p>
                  <p><strong>Пробег:</strong> {service.mileage.toLocaleString('bg-BG')} км</p>
                  <p><strong>Сервиз:</strong> {service.serviceStation || 'Н/А'}</p>
                  {service.notes && <p className="notes"><strong>Бележки:</strong> {service.notes}</p>}
                </div>
                <div className="service-record-footer">
                  <span className="cost">{service.cost} лв.</span>
                </div>
              </article>
            ))
        ) : (
          <p className="empty-state">Все още нямате добавени обслужвания.</p>
        )}
      </div>
    </section>
  );

const DashboardScreen: FC<{ car: Car; services: ServiceRecord[], user: User }> = ({ car, services, user }) => (
    <div className="screen-content">
        <h1>Добре дошъл, {user.fullName.split(' ')[0] || user.username}!</h1>
        <div className="dashboard-grid">
             <div className="card car-summary-card">
                 <h2 className="card-title">{car.make || 'Твоят'} {car.model || 'Автомобил'}</h2>
                 <p><strong>Пробег:</strong> {car.mileage.toLocaleString('bg-BG')} км</p>
                 <p><strong>Година:</strong> {car.year}</p>
                 <p><strong>VIN:</strong> {car.vin || 'Няма въведен'}</p>
             </div>
             <div className="card stats-card">
                <h2 className="card-title">Статистика</h2>
                <div className="stats-content">
                    <div>
                        <span className="stat-value">{services.length}</span>
                        <span className="stat-label">Общо обслужвания</span>
                    </div>
                    <div>
                        <span className="stat-value">{services.reduce((acc, s) => acc + s.cost, 0).toLocaleString('bg-BG')} лв.</span>
                        <span className="stat-label">Общо похарчени</span>
                    </div>
                </div>
             </div>
        </div>
       
        <ServiceHistory services={services} />
    </div>
);

const CarProfileScreen: FC<{ car: Car, onUpdate: (updatedCar: Car) => void }> = ({ car, onUpdate }) => {
    const [formData, setFormData] = useState(car);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'year' || name === 'mileage' ? Number(value) || 0 : value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(formData);
        alert('Данните за автомобила са запазени!');
    };

    return (
        <div className="screen-content">
            <h1>Моят Автомобил</h1>
            <div className="card">
                <form className="car-profile-form" onSubmit={handleSave}>
                    <div className="car-image-container">
                        {formData.imageUrl ? (
                            <img src={formData.imageUrl} alt={`${formData.make} ${formData.model}`} className="car-image" />
                        ) : (
                            <div className="car-image-placeholder">
                                <span className="material-symbols-outlined">photo_camera</span>
                                <p>Няма снимка</p>
                            </div>
                        )}
                    </div>
                    <div className="form-fields">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Марка</label>
                                <input name="make" type="text" value={formData.make} onChange={handleChange} placeholder="напр. Volkswagen" />
                            </div>
                            <div className="form-group">
                                <label>Модел</label>
                                <input name="model" type="text" value={formData.model} onChange={handleChange} placeholder="напр. Golf" />
                            </div>
                            <div className="form-group">
                                <label>Година</label>
                                <input name="year" type="number" value={formData.year} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Пробег (км)</label>
                                <input name="mileage" type="number" value={formData.mileage} onChange={handleChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>VIN номер</label>
                                <input name="vin" type="text" value={formData.vin} onChange={handleChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>URL на снимка</label>
                                <input name="imageUrl" type="text" value={formData.imageUrl || ''} onChange={handleChange} placeholder="Поставете линк към снимката тук" />
                            </div>
                        </div>
                        <div className="form-actions">
                             <button type="submit" className="btn btn-primary">Запази промените</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DiagnosticsScreen: FC<{car: Car}> = ({car}) => {
    const [problem, setProblem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<AIDiagnosisResponse | null>(null);

    const handleDiagnose = async () => {
        if(!problem.trim()) {
            setError('Моля, опишете проблема.');
            return;
        }
        if(!car.make || !car.model) {
            setError('Моля, първо въведете марка и модел на автомобила в секция "Моят Автомобил".');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResponse(null);
        try {
            const data = await apiService.getAIDiagnosis(car, problem);
            setResponse(data);
        } catch (e: any) {
            setError(e.message || 'Възникна грешка при връзка с AI асистента.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="screen-content">
            <h1>AI Диагностика <span className="pro-badge screen-title-pro">PRO</span></h1>
            <div className="card">
                <p className="page-description">Опишете проблем с автомобила си (напр. "чува се скърцане при завиване наляво", "колата прекъсва при ускорение") и нашият AI асистент ще ви даде възможни причини, сложност и прогнозна цена за ремонт.</p>
                <div className="form-group">
                    <label>Описание на проблема</label>
                    <textarea 
                        value={problem}
                        onChange={e => setProblem(e.target.value)}
                        rows={4}
                        placeholder="Опишете детайлно шума, усещането, кога се появява..."
                    />
                </div>
                <button className="btn btn-primary ai-btn" onClick={handleDiagnose} disabled={isLoading || !ai}>
                     {isLoading ? <div className="loading-spinner" /> : (
                        <>
                            <span className="material-symbols-outlined">auto_awesome</span>
                            Анализирай проблема
                        </>
                    )}
                </button>
                {!ai && <p className="ai-error">AI услугата не е налична. Моля, проверете API ключа.</p>}

                {error && <p className="ai-error">{error}</p>}

                {response && (
                    <div className="ai-assistant diagnostics-result">
                        <h3 className="ai-assistant-header">Резултати от диагностиката</h3>
                        {response.analysis.map((item, index) => (
                            <div key={index} className="diagnosis-item">
                                <h4>{index+1}. {item.possibleCause}</h4>
                                <div className="diagnosis-details">
                                    <span><strong>Сложност:</strong> {item.complexity}</span>
                                    <span><strong>Прогнозна цена:</strong> {item.estimatedCost}</span>
                                </div>
                            </div>
                        ))}
                         <div className="recommendation">
                             <p><strong>Препоръка:</strong> {response.recommendation}</p>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const AddServiceModal: FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (service: Omit<ServiceRecord, 'id' | 'date'>) => void;
    car: Car;
}> = ({ isOpen, onClose, onSave, car }) => {
  const [type, setType] = useState('');
  const [mileage, setMileage] = useState(car.mileage);
  const [cost, setCost] = useState(0);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Общо');
  const [serviceStation, setServiceStation] = useState('');
  
  const [aiResponse, setAiResponse] = useState<AIAdviceResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [errorAI, setErrorAI] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setMileage(car.mileage);
  }, [isOpen, car.mileage])

  const handleSave = () => {
    if (type && mileage > 0 && cost >= 0) {
      onSave({ type, mileage, cost, notes, category, serviceStation });
      handleClose();
    } else {
      alert('Моля, попълнете тип на обслужването, пробег и цена.');
    }
  };
  
  const handleClose = () => {
    setType(''); setCost(0); setNotes(''); setCategory('Общо');
    setServiceStation(''); setAiResponse(null); setIsLoadingAI(false); setErrorAI(null);
    onClose();
  }

  const getAIAdvice = useCallback(async () => {
    if (!type) {
        setErrorAI('Моля, въведете тип на обслужването, за да получите съвет.');
        return;
    }
    setIsLoadingAI(true); setErrorAI(null); setAiResponse(null);
    try {
        const data = await apiService.getAIAdvice(car, type);
        setAiResponse(data);
    } catch (e: any) {
        setErrorAI(e.message || 'Възникна грешка при връзка с AI асистента.');
    } finally {
        setIsLoadingAI(false);
    }
  }, [type, car]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Ново обслужване / Ремонт</h2>
          <button onClick={handleClose} className="modal-close-btn" aria-label="Затвори">&times;</button>
        </header>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
                <label>Тип на обслужването</label>
                <input type="text" value={type} onChange={(e) => setType(e.target.value)} placeholder="напр. Смяна на масло и филтри" />
            </div>
            <div className="form-group">
                <label>Категория</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option>Общо</option> <option>Двигател</option> <option>Спирачна система</option>
                    <option>Окачване</option> <option>Електрическа система</option>
                    <option>Гуми и джанти</option> <option>Друго</option>
                </select>
            </div>
            <div className="form-group"><label>Пробег (км)</label><input type="number" value={mileage} onChange={(e) => setMileage(Number(e.target.value))} /></div>
            <div className="form-group"><label>Цена (лв.)</label><input type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} /></div>
            <div className="form-group full-width"><label>Сервиз</label><input type="text" value={serviceStation} onChange={(e) => setServiceStation(e.target.value)} placeholder="Име на сервиза (по желание)" /></div>
            <div className="form-group full-width"><label>Бележки</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="напр. Марка масло, специфични части..."></textarea></div>
          </div>
          {ai && <button className="btn btn-secondary ai-btn" onClick={getAIAdvice} disabled={isLoadingAI}>
              {isLoadingAI ? <div className="loading-spinner" /> : (<><span className="material-symbols-outlined">auto_awesome</span>Получи съвет и оценка с AI</>)}
          </button>}
          {errorAI && <p className="ai-error">{errorAI}</p>}
          {aiResponse && (
            <div className="ai-assistant"><h3 className="ai-assistant-header"><span className="material-symbols-outlined">auto_awesome</span>AI Асистент</h3>
                <div className="ai-assistant-content">
                    <p><strong>Прогнозна цена:</strong> {aiResponse.estimatedCost}</p>
                    <p><strong>Следващо обслужване:</strong> {aiResponse.nextServiceSuggestion}</p>
                    {aiResponse.additionalTips?.length > 0 && (<>
                         <p><strong>Допълнителни съвети:</strong></p>
                         <ul>{aiResponse.additionalTips.map((tip, i) => <li key={i}>{tip}</li>)}</ul></>)}
                </div>
            </div>
          )}
        </div>
        <footer className="modal-actions">
          <button className="btn btn-secondary" onClick={handleClose}>Отказ</button>
          <button className="btn btn-primary" onClick={handleSave}>Запази</button>
        </footer>
      </div>
    </div>
  );
};

const ProfileSettingsModal: FC<{ 
    isOpen: boolean; 
    onClose: () => void;
    user: User;
    onSave: (updatedData: Partial<User>) => void;
    onLogout: () => void;
}> = ({ isOpen, onClose, user, onSave, onLogout }) => {
    const [formData, setFormData] = useState({
        fullName: user.fullName, email: user.email, phone: user.phone
    });
    const [passData, setPassData] = useState({ oldPass: '', newPass: '' });

    useEffect(() => {
      setFormData({ fullName: user.fullName, email: user.email, phone: user.phone });
    }, [user]);

    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setPassData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveData = () => {
        onSave(formData);
        alert('Данните са актуализирани!');
    };

    const handleSavePassword = () => {
        if (passData.oldPass !== user.password) {
            alert('Грешна стара парола!');
            return;
        }
        if (passData.newPass.length < 3) {
            alert('Новата парола трябва да е поне 3 символа.');
            return;
        }
        onSave({ password: passData.newPass });
        setPassData({ oldPass: '', newPass: '' });
        alert('Паролата е сменена успешно!');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Настройки на профила</h2>
                    <button onClick={onClose} className="modal-close-btn" aria-label="Затвори">&times;</button>
                </header>
                <div className="modal-body">
                    <section className="modal-section">
                        <h3>Лични данни</h3>
                        <div className="form-group"><label>Име</label><input type="text" name="fullName" value={formData.fullName} onChange={handleDataChange} /></div>
                        <div className="form-group"><label>Имейл</label><input type="email" name="email" value={formData.email} onChange={handleDataChange} disabled /></div>
                        <div className="form-group"><label>Телефон</label><input type="tel" name="phone" value={formData.phone} onChange={handleDataChange} /></div>
                        <div className="form-actions-inline">
                            <button className="btn btn-primary" onClick={handleSaveData}>Запази данни</button>
                        </div>
                    </section>
                    <hr className="modal-divider" />
                    <section className="modal-section">
                        <h3>Смяна на парола</h3>
                        <div className="form-group"><label>Стара парола</label><input type="password" name="oldPass" value={passData.oldPass} onChange={handlePassChange} /></div>
                        <div className="form-group"><label>Нова парола</label><input type="password" name="newPass" value={passData.newPass} onChange={handlePassChange} /></div>
                        <div className="form-actions-inline">
                            <button className="btn btn-secondary" onClick={handleSavePassword}>Смени паролата</button>
                        </div>
                    </section>
                </div>
                <footer className="modal-actions">
                    <button className="btn btn-danger" onClick={onLogout}>Изход от профила</button>
                </footer>
            </div>
        </div>
    );
};


// --- ГЛАВЕН КОМПОНЕНТ НА ПРИЛОЖЕНИЕТО ---
const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [view, setView] = useState<View>('dashboard');
  
  const [car, setCar] = useState<Car | null>(null);
  const [services, setServices] = useState<ServiceRecord[] | null>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
        setCar(dataService.getCar(currentUser.username));
        setServices(dataService.getServices(currentUser.username));
    } else {
        setCar(null);
        setServices(null);
    }
  }, [currentUser]);

  const saveData = useCallback((updatedCar: Car, updatedServices: ServiceRecord[]) => {
      if(currentUser) {
        dataService.saveData(currentUser.username, updatedCar, updatedServices);
      }
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => setCurrentUser(user);
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsProfileModalOpen(false); // Затваряме модала при изход
  };
  
  const handleCarUpdate = (updatedCar: Car) => {
      if(services) {
          setCar(updatedCar);
          saveData(updatedCar, services);
      }
  };

  const handleProfileUpdate = (updatedData: Partial<User>) => {
    if (currentUser) {
        const updatedUser = authService.updateUser(currentUser.username, updatedData);
        setCurrentUser(updatedUser);
    }
  };

  const handleAddService = (serviceData: Omit<ServiceRecord, 'id' | 'date'>) => {
      if(car && services) {
        const newService: ServiceRecord = { ...serviceData, id: new Date().toISOString(), date: new Date().toISOString().split('T')[0] };
        const newServices = [...services, newService];
        const newCar = serviceData.mileage > car.mileage ? { ...car, mileage: serviceData.mileage } : car;

        setServices(newServices);
        setCar(newCar);
        saveData(newCar, newServices);
      }
  };

  if (!currentUser) return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  if (!car || !services) return <div className="loading-spinner-fullpage"></div>; // Loading state

  const renderView = () => {
    switch(view) {
        case 'dashboard': return <DashboardScreen car={car} services={services} user={currentUser} />;
        case 'car_profile': return <CarProfileScreen car={car} onUpdate={handleCarUpdate} />;
        case 'diagnostics': return <DiagnosticsScreen car={car} />;
        default: return <DashboardScreen car={car} services={services} user={currentUser} />;
    }
  };

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar 
            isCollapsed={isSidebarCollapsed}
            toggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
            currentView={view} 
            onNavigate={setView} 
            user={currentUser} 
            onLogout={handleLogout} 
            onProfileClick={() => setIsProfileModalOpen(true)}
        />
        <main className="main-content">
            <header className="main-header">
                <button className="btn btn-primary" onClick={() => setIsAddServiceModalOpen(true)}>
                    <span className="material-symbols-outlined">add</span>
                    Добави обслужване
                </button>
            </header>
            <div className="content-wrapper" key={view}>
                {renderView()}
            </div>
        </main>
        <AddServiceModal isOpen={isAddServiceModalOpen} onClose={() => setIsAddServiceModalOpen(false)} onSave={handleAddService} car={car} />
        <ProfileSettingsModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={currentUser}
            onSave={handleProfileUpdate}
            onLogout={handleLogout}
        />
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}