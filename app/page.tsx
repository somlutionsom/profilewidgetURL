'use client';

import { useEffect, useState } from 'react';
import { signUp, signIn, signOut, getCurrentUser, getSession, onAuthStateChange, getUserProfile, saveUserProfile, updateProfileName, updateFirstText, updateSecondText } from '../lib/supabase';
import WidgetManager from '../components/WidgetManager';

export default function Home() {
  const [texts, setTexts] = useState({
    first: '문구를 입력해 주세요 ♡',
    second: '문구를 입력해 주세요 ♡'
  });
  
  const [profileName, setProfileName] = useState('♡⸝⸝');
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  
  const [dateString, setDateString] = useState('');
  const [dayString, setDayString] = useState('');
  
  const [buttonColor, setButtonColor] = useState('#FFD0D8');
  const [showColorPalette, setShowColorPalette] = useState(false);
  
  const [savedUrl, setSavedUrl] = useState('');
  const [editingUrl, setEditingUrl] = useState(false);
  const [editUrlValue, setEditUrlValue] = useState('');
  
  
  // 로그인 팝업 관련 상태
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // true: 로그인, false: 회원가입
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  
  const [editing, setEditing] = useState({
    first: false,
    second: false
  });
  
  const [editValues, setEditValues] = useState({
    first: '',
    second: ''
  });
  
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  
  const [text, setText] = useState('');
  const [hyperlink, setHyperlink] = useState('');
  
  // 로딩 상태 추가
  const [isSaving, setIsSaving] = useState(false);
  
  // 위젯 관리 모드
  const [showWidgetManager, setShowWidgetManager] = useState(false);

  const handleEdit = (key: 'first' | 'second') => {
    setEditing(prev => ({ ...prev, [key]: true }));
    setEditValues(prev => ({ ...prev, [key]: texts[key] }));
  };

  const handleSave = async (key: 'first' | 'second') => {
    console.log(`${key} 텍스트 저장 시작:`, editValues[key]);
    setTexts(prev => ({ ...prev, [key]: editValues[key] }));
    setEditing(prev => ({ ...prev, [key]: false }));
    
    // 텍스트 저장
    try {
      if (key === 'first') {
        console.log('saveFirstText 호출 중...');
        await saveFirstText();
        console.log('첫번째 텍스트 저장 성공!');
      } else {
        console.log('saveSecondText 호출 중...');
        await saveSecondText();
        console.log('두번째 텍스트 저장 성공!');
      }
    } catch (error) {
      console.error(`${key} 텍스트 저장 실패:`, error);
    }
  };

  const handleCancel = (key: 'first' | 'second') => {
    setEditing(prev => ({ ...prev, [key]: false }));
    setEditValues(prev => ({ ...prev, [key]: texts[key] }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    document.getElementById('avatar-input')?.click();
  };

  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerClick = () => {
    document.getElementById('banner-input')?.click();
  };

  const handleNameEdit = () => {
    setEditingName(true);
    setEditNameValue(profileName);
  };

  const handleNameSave = async () => {
    console.log('닉네임 저장 시작:', editNameValue);
    setProfileName(editNameValue);
    setEditingName(false);
    
    // 닉네임 저장
    try {
      console.log('saveProfileName 호출 중...');
      await saveProfileName();
      console.log('닉네임 저장 성공!');
    } catch (error) {
      console.error('닉네임 저장 실패:', error);
    }
  };

  const handleNameCancel = () => {
    setEditingName(false);
    setEditNameValue(profileName);
  };

  const handleButtonClick = () => {
    setShowColorPalette(!showColorPalette);
  };

  const handleColorSelect = (color: string) => {
    setButtonColor(color);
    setShowColorPalette(false);
  };

  const handleUrlEdit = () => {
    setEditingUrl(true);
    setEditUrlValue(savedUrl);
  };

  const handleUrlSave = () => {
    setSavedUrl(editUrlValue);
    setEditingUrl(false);
  };

  const handleUrlCancel = () => {
    setEditingUrl(false);
    setEditUrlValue(savedUrl);
  };

  const handleUrlClick = () => {
    if (savedUrl) {
      // URL이 http:// 또는 https://로 시작하지 않으면 https:// 추가
      const url = savedUrl.startsWith('http://') || savedUrl.startsWith('https://') 
        ? savedUrl 
        : `https://${savedUrl}`;
      window.open(url, '_blank');
    } else {
      handleUrlEdit();
    }
  };


  const colorPalette = [
    '#FFE3ED', // (1,1) - 요청 색상
    '#FFC1DA', // (1,2) - 요청 색상
    '#DC143C', // (1,3) - 요청 색상
    '#D0E7FF', // 연한 파랑
    '#9FB3DF', // (1,5) - 요청 색상
    '#9EC6F3', // (2,1) - 요청 색상
    '#2C2C2E', // 검은색
    '#8E8E93', // 중간 회색
    '#C7C7CC', // 옅은 회색
    '#FFF2E0', // (2,5) - 요청 색상
    '#E4EFE7', // (3,1) - 요청 색상
    '#064420', // (3,2) - 요청 색상
    '#EBD6FB', // (3,4) - 요청 색상
    '#D0B4FF', // 보라
    '#090040', // (3,5) - 요청 색상
  ];

  // 로그인 관련 함수들
  const handleLoginPopupOpen = () => {
    setShowLoginPopup(true);
    setLoginError('');
  };

  const handleLoginPopupClose = () => {
    setShowLoginPopup(false);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    setIsLogin(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      const result = isLogin 
        ? await signIn(loginEmail, loginPassword)
        : await signUp(loginEmail, loginPassword);

      if (result.success) {
        // 로그인/회원가입 성공
        const userResult = await getCurrentUser();
        if (userResult.success && userResult.user) {
          setCurrentUser(userResult.user);
          // 사용자 데이터 불러오기
          await loadProfileData(userResult.user.id);
        }
        handleLoginPopupClose();
      } else {
        setLoginError(result.error || '오류가 발생했습니다.');
      }
    } catch {
      setLoginError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      setCurrentUser(null);
      // 로그아웃 시 로컬 상태 초기화
      setTexts({
        first: '문구를 입력해 주세요 ♡',
        second: '문구를 입력해 주세요 ♡'
      });
      setProfileName('♡⸝⸝');
      setButtonColor('#FFD0D8');
      setSavedUrl('');
      setAvatarImage(null);
      setBannerImage(null);
    }
  };

  // 닉네임만 저장하는 함수
  const saveProfileName = async () => {
    console.log('saveProfileName 함수 시작, currentUser:', currentUser);
    if (!currentUser) {
      console.log('사용자가 로그인되지 않음, 저장 건너뜀');
      return;
    }
    
    console.log('닉네임 저장할 데이터:', profileName);
    
    try {
      const result = await updateProfileName(profileName);
      console.log('updateProfileName 결과:', result);
      if (!result.success) {
        throw new Error(result.error);
      }
      console.log('닉네임 저장 완료!');
    } catch (error) {
      console.error('닉네임 저장 실패:', error);
      throw error;
    }
  };

  // 첫번째 문구만 저장하는 함수
  const saveFirstText = async () => {
    if (!currentUser) {
      console.log('사용자가 로그인되지 않음, 저장 건너뜀');
      return;
    }
    
    console.log('첫번째 텍스트 저장할 데이터:', texts.first);
    
    try {
      const result = await updateFirstText(texts.first);
      console.log('updateFirstText 결과:', result);
      if (!result.success) {
        throw new Error(result.error);
      }
      console.log('첫번째 텍스트 저장 완료!');
    } catch (error) {
      console.error('첫번째 문구 저장 실패:', error);
      throw error;
    }
  };

  // 두번째 문구만 저장하는 함수
  const saveSecondText = async () => {
    if (!currentUser) {
      console.log('사용자가 로그인되지 않음, 저장 건너뜀');
      return;
    }
    
    console.log('두번째 텍스트 저장할 데이터:', texts.second);
    
    try {
      const result = await updateSecondText(texts.second);
      console.log('updateSecondText 결과:', result);
      if (!result.success) {
        throw new Error(result.error);
      }
      console.log('두번째 텍스트 저장 완료!');
    } catch (error) {
      console.error('두번째 문구 저장 실패:', error);
      throw error;
    }
  };

  // 사용자 프로필 데이터 저장 함수 (재시도 로직 포함 - 요일 버튼용)
  const saveProfileData = async (retryCount = 0) => {
    if (!currentUser) {
      console.log('사용자가 로그인되지 않음, 저장 건너뜀');
      return;
    }
    
    const profileData = {
      profile_name: profileName,
      button_color: buttonColor,
      avatar_image: avatarImage || undefined,
      banner_image: bannerImage || undefined,
      saved_url: savedUrl || undefined,
      first_text: texts.first,
      second_text: texts.second,
      text: text,
      hyperlink: hyperlink
    };
    
    try {
      const result = await saveUserProfile(profileData);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`프로필 저장 실패 (시도 ${retryCount + 1}):`, error);
      
      // 타임아웃 오류이고 재시도 횟수가 2번 미만이면 재시도
      if (retryCount < 2 && (error instanceof Error && error.message.includes('timeout'))) {
        console.log('재시도 중...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
        return saveProfileData(retryCount + 1);
      }
      
      throw error; // 오류를 상위로 전파하여 UI에서 처리
    }
  };

  // 사용자 프로필 데이터 불러오기 함수 (최적화됨)
  const loadProfileData = async (userId: string) => {
    try {
      const result = await getUserProfile(userId);
      if (result.success && result.data) {
        const profile = result.data;
        
        // 배치로 상태 업데이트 (리렌더링 최소화)
        setProfileName(profile.profile_name || '♡⸝⸝');
        setButtonColor(profile.button_color || '#FFD0D8');
        setAvatarImage(profile.avatar_image || null);
        setBannerImage(profile.banner_image || null);
        setSavedUrl(profile.saved_url || '');
        setTexts({
          first: profile.first_text || '문구를 입력해 주세요 ♡',
          second: profile.second_text || '문구를 입력해 주세요 ♡'
        });
        setText(profile.text || '');
        setHyperlink(profile.hyperlink || '');
      }
    } catch (error) {
      console.error('프로필 데이터 불러오기 중 예외 발생:', error);
    } finally {
      // 프로필 로딩 완료
    }
  };

  useEffect(() => {
    // 모바일 호환성을 위한 초기화
    const initializeApp = () => {
      try {
        // 오늘 날짜를 가져와서 버튼에 표시
        const today = new Date();
        const day = today.getDate().toString().padStart(2, '0');
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const year = today.getFullYear().toString().slice(-2);
        
        const newDateString = `♥ ${year}. ${month}. ${day} ♥`;
        setDateString(newDateString);

        // 요일을 영어 3글자로 표시
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const dayOfWeek = dayNames[today.getDay()];
        setDayString(dayOfWeek);
        
        console.log('앱 초기화 완료 - 모바일 호환성 확인');
      } catch (error) {
        console.error('앱 초기화 중 오류:', error);
      }
    };

    // 모바일에서 즉시 실행, 데스크톱에서는 약간 지연
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        initializeApp();
      } else {
        setTimeout(initializeApp, 100);
      }
    }

    // 사용자 로그인 상태 확인 및 데이터 불러오기 (모바일 호환성 강화)
    const checkUserAndLoadData = async () => {
      try {
        // 모바일에서 네트워크 연결 확인
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          console.log('오프라인 상태 - 로그인 상태 확인 건너뜀');
          return;
        }

        // 먼저 세션 확인
        const sessionResult = await getSession();
        if (sessionResult.success && sessionResult.session) {
          console.log('기존 세션 발견:', sessionResult.session.user.email);
          setCurrentUser(sessionResult.session.user);
          loadProfileData(sessionResult.session.user.id);
          return;
        }

        // 세션이 없으면 사용자 정보 확인
        const userResult = await getCurrentUser();
        if (userResult.success && userResult.user) {
          console.log('사용자 정보 확인됨:', userResult.user.email);
          setCurrentUser(userResult.user);
          loadProfileData(userResult.user.id);
        } else {
          console.log('로그인되지 않은 상태');
        }
      } catch (error) {
        console.error('사용자 확인 중 오류:', error);
        // 모바일에서 오류 발생 시 기본 상태 유지
      }
    };

    // 모바일에서 지연 로딩 적용
    const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      // 모바일에서는 약간 지연 후 로딩
      setTimeout(checkUserAndLoadData, 200);
    } else {
      checkUserAndLoadData();
    }

    // 인증 상태 변화 감지 리스너 설정
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('인증 상태 변화:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setCurrentUser(session.user);
        loadProfileData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        // 로그아웃 시 로컬 상태 초기화
        setTexts({
          first: '문구를 입력해 주세요 ♡',
          second: '문구를 입력해 주세요 ♡'
        });
        setProfileName('♡⸝⸝');
        setButtonColor('#FFD0D8');
        setSavedUrl('');
        setAvatarImage(null);
        setBannerImage(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // 토큰 갱신 시 사용자 정보 업데이트
        setCurrentUser(session.user);
      }
    });

    // 컴포넌트 언마운트 시 리스너 정리
    return () => {
      subscription?.unsubscribe();
    };
  }, []);


  // 수동 저장 함수 (최적화됨)
  const handleManualSave = async () => {
    if (!currentUser) {
      handleLoginPopupOpen();
      return;
    }
    
    if (isSaving) return; // 중복 저장 방지
    
    setIsSaving(true);
    const button = document.querySelector('.secondary-button') as HTMLElement;
    const originalText = button?.textContent || '';
    
    try {
      if (button) {
        button.textContent = '저장 중...';
        button.style.backgroundColor = '#ffa726';
      }
      
      await saveProfileData();
      
      if (button) {
        button.textContent = '✓ 저장됨';
        button.style.backgroundColor = '#4CAF50';
      }
    } catch (error) {
      console.error('저장 중 오류:', error);
      if (button) {
        button.textContent = '✗ 오류';
        button.style.backgroundColor = '#f44336';
      }
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        if (button) {
          button.textContent = originalText;
          button.style.backgroundColor = '';
        }
      }, 1500);
    }
  };

  // 위젯 관리 모드일 때는 WidgetManager 컴포넌트 표시
  if (showWidgetManager && currentUser) {
    return (
      <WidgetManager 
        currentProfile={{
          profile_name: profileName,
          button_color: buttonColor,
          avatar_image: avatarImage || undefined,
          banner_image: bannerImage || undefined,
          saved_url: savedUrl,
          first_text: texts.first,
          second_text: texts.second
        }}
      />
    )
  }

  return (
    <div className="main-container">
      {/* Outer Container */}
      <div className="outer-container">
        {/* Profile Card Container */}
        <div className="profile-card">
        
        {/* Header Banner */}
        <div 
          className="header-banner" 
          onClick={handleBannerClick}
          style={{ backgroundColor: buttonColor }}
        >
          {bannerImage ? (
            <img 
              src={bannerImage} 
              alt="Banner" 
              className="banner-image"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          ) : (
            <div className="banner-placeholder" style={{ backgroundColor: buttonColor }}>
            </div>
          )}
        </div>
        <input
          id="banner-input"
          type="file"
          accept="image/*"
          onChange={handleBannerChange}
          style={{ display: 'none' }}
        />
        
        {/* Profile Avatar - Overlapping */}
        <div className="avatar-container">
          <div className="profile-avatar" onClick={handleAvatarClick}>
            {avatarImage ? (
              <img 
                src={avatarImage} 
                alt="Profile" 
                className="avatar-image"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            ) : (
              <div className="avatar-placeholder">
              </div>
            )}
          </div>
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
        </div>
        
        {/* Profile Content */}
        <div className="profile-content">
          
          {/* Name/Handle */}
          <div className="profile-name">
            {editingName ? (
              <div className="name-edit-container">
                <input
                  type="text"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  className="name-edit-input"
                  style={{ borderColor: buttonColor }}
                  autoFocus
                />
                <button 
                  onClick={handleNameSave}
                  className="name-save-button"
                  style={{ backgroundColor: buttonColor }}
                >
                  ✓
                </button>
                <button 
                  onClick={handleNameCancel}
                  className="name-cancel-button"
                >
                  ✕
                </button>
              </div>
            ) : (
              <h1 
                className="clickable-name"
                onClick={handleNameEdit}
              >
                {profileName}
              </h1>
            )}
          </div>
          
          {/* Action Buttons Row */}
          <div className="action-buttons">
            <div className="button-with-palette">
              <button 
                className="primary-button" 
                onClick={handleButtonClick}
                style={{ backgroundColor: buttonColor }}
              >
                {dateString}
              </button>
              {showColorPalette && (
                <div className="color-palette">
                  {colorPalette.map((color, index) => (
                    <button
                      key={index}
                      className="color-option"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </div>
              )}
            </div>
            <button 
              className="secondary-button" 
              onClick={handleManualSave}
              title="저장하기"
              disabled={isSaving}
              style={{ 
                opacity: isSaving ? 0.7 : 1,
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              {isSaving ? '저장중...' : dayString}
            </button>
            <button 
              className="icon-button"
              style={{ 
                backgroundColor: buttonColor
              }}
              onClick={handleUrlClick}
              title={savedUrl ? `링크: ${savedUrl}` : 'URL 설정'}
            >
              🔗
            </button>
          </div>
          
          
          {/* Interaction Icons */}
          <div className="interaction-icons">
            <div className="icon-item">
              <span className="icon">♡⸝⸝</span>
              {editing.first ? (
                <div className="edit-container">
                <input
                  type="text"
                  value={editValues.first}
                  onChange={(e) => setEditValues(prev => ({ ...prev, first: e.target.value }))}
                  className="edit-input"
                  style={{ borderColor: buttonColor }}
                  autoFocus
                />
                  <button 
                    onClick={() => handleSave('first')}
                    className="save-button"
                    style={{ backgroundColor: buttonColor }}
                  >
                    ✓
                  </button>
                  <button 
                    onClick={() => handleCancel('first')}
                    className="cancel-button"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span 
                  className="text clickable-text"
                  onClick={() => handleEdit('first')}
                >
                  {texts.first}
                </span>
              )}
            </div>
            <div className="icon-item">
              <span className="icon">˚୨୧*˚</span>
              {editing.second ? (
                <div className="edit-container">
                  <input
                    type="text"
                    value={editValues.second}
                    onChange={(e) => setEditValues(prev => ({ ...prev, second: e.target.value }))}
                    className="edit-input"
                    style={{ borderColor: buttonColor }}
                    autoFocus
                  />
                  <button 
                    onClick={() => handleSave('second')}
                    className="save-button"
                    style={{ backgroundColor: buttonColor }}
                  >
                    ✓
                  </button>
                  <button 
                    onClick={() => handleCancel('second')}
                    className="cancel-button"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span 
                  className="text clickable-text"
                  onClick={() => handleEdit('second')}
                >
                  {texts.second}
                </span>
              )}
            </div>
          </div>
          
          {/* Login/Logout Text */}
          <div style={{marginTop: '36px', paddingBottom: '20px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1000, gap: '20px'}}>
            {currentUser && (
              <span 
                onClick={() => setShowWidgetManager(!showWidgetManager)}
                title="위젯 관리"
                style={{
                  fontSize: '12px', 
                  color: '#666', 
                  cursor: 'pointer', 
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: '300',
                }}
              >
                {showWidgetManager ? "프로필" : "위젯"}
              </span>
            )}
            <span 
              onClick={currentUser ? handleLogout : handleLoginPopupOpen}
              title={currentUser ? "로그아웃" : "로그인"}
              style={{
                fontSize: '12px', 
                color: '#666', 
                cursor: 'pointer', 
                fontFamily: 'Pretendard, sans-serif',
                fontWeight: '300',
                transition: 'color 0.2s ease'
              }}
            >
              {currentUser ? "logout" : "login"}
            </span>
          </div>
          
        </div>
        
        </div>
      </div>
      
      {/* URL Edit Popup */}
      {editingUrl && (
        <div className="url-popup-overlay" onClick={handleUrlCancel}>
          <div className="url-popup" onClick={(e) => e.stopPropagation()}>
            <div className="url-popup-header">
              <span className="url-popup-title">URL 입력</span>
              <button 
                className="url-popup-close"
                onClick={handleUrlCancel}
              >
                ✕
              </button>
            </div>
            <div className="url-popup-content">
              <input
                type="url"
                value={editUrlValue}
                onChange={(e) => setEditUrlValue(e.target.value)}
                className="url-popup-input"
                style={{
                  borderColor: buttonColor,
                  border: `2px solid ${buttonColor}`
                }}
                placeholder="https://example.com"
                autoFocus
              />
              <div className="url-popup-buttons">
                <button 
                  onClick={handleUrlCancel}
                  className="url-popup-cancel"
                >
                  취소
                </button>
                <button 
                  onClick={handleUrlSave}
                  className="url-popup-save"
                  style={{ backgroundColor: buttonColor }}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Login Popup */}
      {showLoginPopup && (
        <div className="login-popup-overlay" onClick={handleLoginPopupClose}>
          <div className="login-popup" onClick={(e) => e.stopPropagation()}>
            <div className="login-popup-header">
              <span className="login-popup-title">
                {isLogin ? '로그인' : '회원가입'}
              </span>
              <button 
                className="login-popup-close"
                onClick={handleLoginPopupClose}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleLoginSubmit} className="login-popup-content">
              <div className="login-input-group">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="login-input"
                  placeholder="이메일"
                  required
                />
              </div>
              <div className="login-input-group">
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="login-input"
                  placeholder="비밀번호"
                  required
                />
              </div>
              {loginError && (
                <div className="login-error">{loginError}</div>
              )}
              <div className="login-buttons">
                <button 
                  type="submit"
                  className="login-submit-button"
                  style={{ backgroundColor: buttonColor }}
                  disabled={isLoading}
                >
                  {isLoading ? '처리중...' : (isLogin ? '로그인' : '회원가입')}
                </button>
              </div>
              <div className="login-switch">
                <span>
                  {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                </span>
                <button 
                  type="button"
                  className="login-switch-button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setLoginError('');
                  }}
                >
                  {isLogin ? '회원가입' : '로그인'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}