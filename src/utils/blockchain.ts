
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/contracts/propertyContract';
import { getWeb3Provider, getAccount } from './wallet';

// 지분 여러개 구매
export const buyShares = async (propertyId: number, numberOfShares: number) => {
    const web3 = getWeb3Provider();
    if (!web3) {
        throw new Error("Web3 provider not found");
    }

    const account = await getAccount();
    if (!account) {
        throw new Error("지갑이 연결되어 있지 않습니다");
    }

    const propertyManager = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    const sharePrice = await propertyManager.methods.getSharePrice(propertyId).call();
    
    // 임시로 getPendingBuyers 대신 0으로 설정 (실제로는 컨트랙트에서 가져와야 함)
    const leftShares = 20 - 0; // 총 20개 지분 중 남은 지분

    if (leftShares < numberOfShares) {
        throw new Error("❌ 남은 지분이 부족합니다");
    }

    const tx = await propertyManager.methods.reserveShares(propertyId, numberOfShares).send({
        from: account,
        value: sharePrice * numberOfShares
    });
    
    return tx;
};

// 월세 납부 및 배분
export const distributeRent = async (propertyId: number) => {
    const web3 = getWeb3Provider();
    if (!web3) {
        throw new Error("Web3 provider not found");
    }

    const account = await getAccount();
    if (!account) {
        throw new Error("지갑이 연결되어 있지 않습니다");
    }

    const propertyManager = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    const property = await propertyManager.methods.getPropertyInfo(propertyId).call();
    const rent = property[6]; // rent는 property 정보의 7번째 요소 (index 6)
    
    const tx = await propertyManager.methods.distributeRent(propertyId).send({
        from: account,
        value: rent
    });
    
    return tx;
};

// 부동산 정보 조회
export const getPropertyInfo = async (propertyId: number) => {
    const web3 = getWeb3Provider();
    if (!web3) {
        throw new Error("Web3 provider not found");
    }

    const propertyManager = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    const propertyInfo = await propertyManager.methods.getPropertyInfo(propertyId).call();
    return propertyInfo;
};

// 남은 지분 개수 조회
export const getPendingBuyers = async (propertyId: number) => {
    const web3 = getWeb3Provider();
    if (!web3) {
        throw new Error("Web3 provider not found");
    }

    const propertyManager = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    const propertyInfo = await propertyManager.methods.getPropertyInfo(propertyId).call();
    return propertyInfo[6];
};

// 지분 가격 조회
export const getSharePrice = async (propertyId: number) => {
    const web3 = getWeb3Provider();
    if (!web3) {
        throw new Error("Web3 provider not found");
    }

    const propertyManager = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    const sharePrice = await propertyManager.methods.getSharePrice(propertyId).call();
    return Number(sharePrice) / 1e18;
};

// 지분 개수 계산 (percentage를 5로 나누어 계산)
export const calculateShareCount = (percentage: number): number => {
    return percentage / 5;
};
