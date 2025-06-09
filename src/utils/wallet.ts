
// 지갑 존재 여부 확인
export const isKaiaWallet = () => {
    return window.klaytn;
}

export const isMetamask = () => {
    return window.ethereum;
}

// Web3 프로바이더 설정
export const getWeb3Provider = () => {
    let Web3;
    // Web3 동적 import 처리
    if (typeof window !== 'undefined') {
        if (isKaiaWallet()) {
            // Kaia wallet 사용 시 Web3 설정
            return window.klaytn;
        } else if (isMetamask()) {
            // MetaMask 사용 시 Web3 설정
            return window.ethereum;
        }
    }
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
            const res = await window.klaytn.enable();
            return res[0];
        } else if (isMetamask()) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
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
    // 로컬 상태만 초기화 (실제 지갑 연결 해제는 브라우저에서 직접 처리)
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletType');
}
