# Firebase 설정 방법 (선생님 간 실시간 공유)

## 왜 필요한가요?
현재는 각 기기(휴대폰/컴퓨터)에 데이터가 따로 저장되어,  
**다른 선생님이 등록해도 내 화면에 반영되지 않습니다.**  
Firebase를 설정하면 모든 선생님 기기가 **즉시 동기화**됩니다.

---

## 설정 순서

### 1단계 – Firebase 프로젝트 만들기
1. [https://console.firebase.google.com](https://console.firebase.google.com) 접속 (구글 계정으로 로그인)
2. **프로젝트 추가** 클릭
3. 프로젝트 이름 입력 (예: `hongbuk-tablet`)
4. Google Analytics는 **사용 안함** 선택 → **프로젝트 만들기**

### 2단계 – 웹 앱 등록
1. 프로젝트 홈에서 **</>** (웹) 아이콘 클릭
2. 앱 닉네임 입력 (예: `tablet-app`) → **앱 등록**
3. `firebaseConfig` 코드가 표시됩니다. 아래처럼 생겼습니다:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "hongbuk-tablet.firebaseapp.com",
  projectId: "hongbuk-tablet",
  storageBucket: "hongbuk-tablet.appspot.com",
  messagingSenderId: "12345678",
  appId: "1:12345678:web:abcdef"
};
```

### 3단계 – 설정값 파일에 붙여넣기
`src/utils/firebaseConfig.js` 파일을 열어서  
위 값으로 교체합니다.

### 4단계 – Firestore 데이터베이스 만들기
1. Firebase 콘솔 왼쪽 메뉴 → **Firestore Database** 클릭
2. **데이터베이스 만들기** 클릭
3. **테스트 모드로 시작** 선택 → **다음** → **완료**

### 5단계 – 보안 규칙 설정 (학교 내부 앱이므로 간단하게)
1. Firestore → **규칙** 탭 클릭
2. 아래 내용으로 교체 후 **게시**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rentals/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 6단계 – 재배포
```bash
git add -A
git commit -m "Firebase 설정 추가"
git push
```

---

## 설정 완료 후
- 어느 선생님이 등록해도 **모든 기기에 즉시 반영**됩니다.
- Firebase 무료 플랜(Spark)으로 충분합니다 (읽기 5만건/일, 쓰기 2만건/일).
