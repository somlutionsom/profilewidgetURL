import { createClient } from '@supabase/supabase-js'

// 환경 변수 확인 및 디버깅
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 개발 환경에서 환경 변수 확인
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Supabase URL:', supabaseUrl ? '설정됨' : '누락됨')
  console.log('Supabase Anon Key:', supabaseAnonKey ? '설정됨' : '누락됨')
}

// 환경 변수가 없으면 에러 표시
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '누락됨')
}

// Supabase 클라이언트 생성 (환경 변수가 있을 때만)
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce'
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
}) : null

// 연결 테스트 함수
export async function testSupabaseConnection() {
  if (!supabase) {
    return { success: false, error: 'Supabase 클라이언트가 초기화되지 않았습니다. 환경 변수를 확인하세요.' }
  }
  
  try {
    // 간단한 연결 테스트 - auth 정보 확인
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Supabase 연결 오류:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Supabase 연결 성공!')
    return { success: true, data }
  } catch (err) {
    console.error('Supabase 연결 실패:', err)
    return { success: false, error: '연결 실패' }
  }
}

// 회원가입 함수 (이메일 확인 없음)
export async function signUp(email: string, password: string) {
  if (!supabase) {
    return { success: false, error: 'Supabase 클라이언트가 초기화되지 않았습니다. 환경 변수를 확인하세요.' }
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined // 이메일 확인 비활성화
      }
    })
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (err) {
    console.error('회원가입 오류:', err)
    return { success: false, error: '회원가입 실패' }
  }
}

// 로그인 함수
export async function signIn(email: string, password: string) {
  if (!supabase) {
    return { success: false, error: 'Supabase 클라이언트가 초기화되지 않았습니다. 환경 변수를 확인하세요.' }
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (err) {
    console.error('로그인 오류:', err)
    return { success: false, error: '로그인 실패' }
  }
}

// 로그아웃 함수
export async function signOut() {
  if (!supabase) {
    return { success: false, error: 'Supabase 클라이언트가 초기화되지 않았습니다. 환경 변수를 확인하세요.' }
  }
  
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (err) {
    console.error('로그아웃 오류:', err)
    return { success: false, error: '로그아웃 실패' }
  }
}

// 현재 사용자 정보 가져오기
export async function getCurrentUser() {
  if (!supabase) {
    return { success: false, error: 'Supabase 클라이언트가 초기화되지 않았습니다. 환경 변수를 확인하세요.' }
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, user }
  } catch (err) {
    console.error('사용자 정보 가져오기 오류:', err)
    return { success: false, error: '사용자 정보 가져오기 실패' }
  }
}

// 세션 정보 가져오기 (더 강력한 세션 관리)
export async function getSession() {
  if (!supabase) {
    return { success: false, error: 'Supabase 클라이언트가 초기화되지 않았습니다. 환경 변수를 확인하세요.' }
  }
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, session }
  } catch {
    return { success: false, error: '세션 정보 가져오기 실패' }
  }
}

// 인증 상태 변화 감지
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

// 사용자 프로필 데이터 타입 정의
export interface UserProfile {
  id?: string
  user_id: string
  profile_name: string
  button_color: string
  avatar_image?: string
  banner_image?: string
  saved_url?: string
  first_text: string
  second_text: string
  text?: string
  hyperlink?: string
  created_at?: string
  updated_at?: string
}

// 사용자 프로필 데이터 가져오기 (최적화됨)
export async function getUserProfile(userId: string) {
  if (!supabase) {
    return { success: false, error: 'Supabase 클라이언트가 초기화되지 않았습니다. 환경 변수를 확인하세요.' }
  }
  
  try {
    console.log('프로필 데이터 불러오기 시도 - 사용자 ID:', userId);
    
    // 인증 확인 제거 - 이미 로그인된 상태에서만 호출되므로 불필요
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // 데이터가 없을 때 - 새 프로필 생성
        console.log('프로필 데이터가 없음, 기본값 반환');
        return { 
          success: true, 
          data: {
            user_id: userId,
            profile_name: '♡⸝⸝',
            button_color: '#FFD0D8',
            first_text: '문구를 입력해 주세요 ♡',
            second_text: '문구를 입력해 주세요 ♡',
            avatar_image: null,
            banner_image: null,
            saved_url: '',
            text: null,
            hyperlink: null
          }
        }
      } else {
        console.error('프로필 데이터 불러오기 오류:', error);
        return { success: false, error: error.message }
      }
    }
    
    console.log('프로필 데이터 불러오기 성공:', data);
    return { success: true, data }
  } catch {
    return { success: false, error: '프로필 데이터 가져오기 실패' }
  }
}

// 닉네임만 업데이트하는 함수
export async function updateProfileName(profileName: string) {
  if (!supabase) {
    return { success: false, error: 'Supabase 클라이언트가 초기화되지 않았습니다. 환경 변수를 확인하세요.' }
  }
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('사용자 인증 실패:', authError);
      return { success: false, error: '로그인이 필요합니다' }
    }

    const result = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        profile_name: profileName
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (result.error) {
      console.error('닉네임 업데이트 실패:', result.error);
      return { success: false, error: result.error.message }
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error('닉네임 업데이트 중 예외 발생:', error);
    return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' }
  }
}

// 첫번째 텍스트만 업데이트하는 함수
export async function updateFirstText(firstText: string) {
  if (!supabase) {
    return { success: false, error: 'Supabase 클라이언트가 초기화되지 않았습니다. 환경 변수를 확인하세요.' }
  }
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('사용자 인증 실패:', authError);
      return { success: false, error: '로그인이 필요합니다' }
    }

    const result = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        first_text: firstText
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (result.error) {
      console.error('첫번째 텍스트 업데이트 실패:', result.error);
      return { success: false, error: result.error.message }
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error('첫번째 텍스트 업데이트 중 예외 발생:', error);
    return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' }
  }
}

// 두번째 텍스트만 업데이트하는 함수
export async function updateSecondText(secondText: string) {
  if (!supabase) {
    return { success: false, error: 'Supabase 클라이언트가 초기화되지 않았습니다. 환경 변수를 확인하세요.' }
  }
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('사용자 인증 실패:', authError);
      return { success: false, error: '로그인이 필요합니다' }
    }

    const result = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        second_text: secondText
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (result.error) {
      console.error('두번째 텍스트 업데이트 실패:', result.error);
      return { success: false, error: result.error.message }
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error('두번째 텍스트 업데이트 중 예외 발생:', error);
    return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' }
  }
}

// 사용자 프로필 데이터 저장/업데이트 (전체 데이터용)
export async function saveUserProfile(profileData: Partial<UserProfile>) {
  if (!supabase) {
    return { success: false, error: 'Supabase 클라이언트가 초기화되지 않았습니다. 환경 변수를 확인하세요.' }
  }
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('사용자 인증 실패:', authError);
      return { success: false, error: '로그인이 필요합니다' }
    }

    // UPSERT 방식으로 단일 쿼리로 처리 (최적화됨)
    const result = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
          profile_name: profileData.profile_name || '♡⸝⸝',
          button_color: profileData.button_color || '#FFD0D8',
          avatar_image: profileData.avatar_image || null,
          banner_image: profileData.banner_image || null,
          saved_url: profileData.saved_url || null,
          first_text: profileData.first_text || '문구를 입력해 주세요 ♡',
          second_text: profileData.second_text || '문구를 입력해 주세요 ♡',
        text: profileData.text || null,
        hyperlink: profileData.hyperlink || null
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (result.error) {
      return { success: false, error: result.error.message || '저장 실패' }
    }

    return { success: true, data: result.data }
  } catch {
    return { success: false, error: '프로필 저장 실패' }
  }
}

