

import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/contracts/propertyContract';
import { getWeb3Provider, getAccount } from './wallet';

// 공통 상수
const GAS_LIMIT = 100000000;

// Web3 인스턴스 생성 헬퍼 함수
const createWeb3Instance = () => {
    const provider = getWeb3Provider();
    if (!provider) {
        throw new Error("Web3 provider not found");
    }
    return new Web3(provider);
};

// 지분 여러개 구매
export const buyShares = async (propertyId: number, numberOfShares: number) => {
    console.log('buyShares 호출:', { propertyId, numberOfShares });
    
    const web3 = createWeb3Instance();
    const account = await getAccount();
    if (!account) {
        throw new Error("지갑이 연결되어 있지 않습니다");
    }

    console.log('Web3 인스턴스 생성 완료, 계정:', account);

    const propertyManager = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    const sharePrice = await propertyManager.methods.getSharePrice(propertyId).call();
    const pendingBuyers = await getPendingBuyers(propertyId);
    const leftShares = 20 - Number(pendingBuyers);
    
    console.log('지분 가격 조회 완료:', sharePrice);
    console.log('남은 지분:', leftShares);

    if (leftShares < numberOfShares) {
        throw new Error("❌ 남은 지분이 부족합니다");
    }

    console.log('트랜잭션 전송 중...');
    
    // BigInt 값을 숫자로 변환하여 계산
    const sharePriceNum = Number(sharePrice);
    const totalValue = sharePriceNum * numberOfShares;
    
    const tx = await propertyManager.methods.reserveShares(propertyId, numberOfShares).send({
        from: account,
        value: totalValue.toString(),
        gas: GAS_LIMIT.toString(),
    });
    
    console.log('트랜잭션 완료:', tx);
    return tx;
};

// 월세 납부 및 배분
export const distributeRent = async (propertyId: number) => {
    console.log('distributeRent 호출:', propertyId);
    
    const web3 = createWeb3Instance();
    const account = await getAccount();
    if (!account) {
        throw new Error("지갑이 연결되어 있지 않습니다");
    }

    const propertyManager = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    const property = await propertyManager.methods.getPropertyInfo(propertyId).call();
    const rent = property[3]; // rent는 property 정보의 4번째 요소 (index 3)
    
    console.log('월세 정보:', rent);
    
    const tx = await propertyManager.methods.distributeRent(propertyId).send({
        from: account,
        value: Number(rent).toString(),
        gas: GAS_LIMIT.toString()
    });
    
    console.log('월세 배분 트랜잭션 완료:', tx);
    return tx;
};

// 부동산 정보 조회 (업데이트됨)
export const getPropertyInfo = async (propertyId: number) => {
    console.log('getPropertyInfo 호출:', propertyId);
    
    const web3 = createWeb3Instance();
    const propertyManager = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    const propertyInfo = await propertyManager.methods.getPropertyInfo(propertyId).call();
    
    console.log('부동산 정보 조회 완료:', propertyInfo);
    return propertyInfo;
};

// 남은 지분 개수 조회 (업데이트됨)
export const getPendingBuyers = async (propertyId: number) => {
    console.log('getPendingBuyers 호출:', propertyId);
    
    const web3 = createWeb3Instance();
    const propertyManager = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    const propertyInfo = await propertyManager.methods.getPropertyInfo(propertyId).call();
    
    console.log('지분 정보 조회 완료:', propertyInfo[6]);
    return propertyInfo[6];
};

// 지분 가격 조회 (업데이트됨)
export const getSharePrice = async (propertyId: number) => {
    console.log('getSharePrice 호출:', propertyId);
    
    const web3 = createWeb3Instance();
    const propertyManager = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    const sharePrice = await propertyManager.methods.getSharePrice(propertyId).call();
    
    const priceInEth = Number(sharePrice) / 1e18;
    console.log('지분 가격 조회 완료:', priceInEth, 'ETH');
    return priceInEth;
};

// 지분 개수 계산 (percentage를 5로 나누어 계산)
export const calculateShareCount = (percentage: number): number => {
    return percentage / 5;
};

