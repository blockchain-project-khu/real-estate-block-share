
// 지갑 존재 여부 확인
export const isKaiaWallet = () => {
    return typeof window !== 'undefined' && window.klaytn;
}

export const isMetamask = () => {
    return typeof window !== 'undefined' && window.ethereum;
}

// Web3 프로바이더 설정
export const getWeb3Provider = () => {
    if (typeof window === 'undefined') {
        console.warn("[getWeb3Provider()] Window object not available");
        return null;
    }

    if (isKaiaWallet()) {
        console.log("[getWeb3Provider()] Kaia wallet 감지됨");
        return window.klaytn;
    } else if (isMetamask()) {
        console.log("[getWeb3Provider()] MetaMask 감지됨");
        return window.ethereum;
    }
    
    console.warn("[getWeb3Provider()] 지원되는 지갑이 없습니다");
    return null;
}

// 계정 주소 가져오기
export const getAccount = async () => {
    const provider = getWeb3Provider();
    if (!provider) {
        console.warn("[getAccount()] Web3 provider not found");
        return null;
    }

    try {
        if (isKaiaWallet()) {
            console.log("[getAccount()] Kaia wallet 계정 요청 중...");
            const res = await window.klaytn.enable();
            console.log("[getAccount()] Kaia wallet 계정:", res[0]);
            return res[0];
        } else if (isMetamask()) {
            console.log("[getAccount()] MetaMask 계정 요청 중...");
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log("[getAccount()] MetaMask 계정:", accounts[0]);
            return accounts[0];
        }
    } catch (error) {
        console.error("지갑 연결 실패:", error);
        return null;
    }
    return null;
}

// 지갑 연결 해제
export const disconnectWallet = () => {
    console.log("[disconnectWallet()] 지갑 연결 해제 중...");
    // 로컬 상태만 초기화 (실제 지갑 연결 해제는 브라우저에서 직접 처리)
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletType');
    console.log("[disconnectWallet()] 지갑 연결 해제 완료");
}
