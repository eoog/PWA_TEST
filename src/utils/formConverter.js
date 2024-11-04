
const formConverter = (currentData) => {
    const newData = currentData;
    currentData[0].검출유무 =0;
    currentData[0].accuracy = 0;
    currentData[0].이벤트 = '';
    currentData[0].포커 = '';
    return newData;
}

export default formConverter;