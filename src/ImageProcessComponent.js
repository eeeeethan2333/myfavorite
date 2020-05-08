import React from 'react'
import { Upload, Button, Row, Col, Card, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
const { Meta } = Card;

const UPLOADING = 1
const INGAME = 2
const EMPTY = 0

function getBase64(file) {

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
}

class ImageProcessComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            fileList: [],
            status: EMPTY,
            leftName: '',
            rightName: '',
            leftImage: '',
            rightImage: '',
            previewImage: '',
            imageMap:new Map()
        }
    }

    // returns random key from Set or Map
    getRandomKey(collection) {
        let keys = Array.from(collection.keys());
        return keys[Math.floor(Math.random() * keys.length)];
    }
    cardOnClick(picName){
        const {imageMap, leftName, rightName} = this.state
        
        if (Array.from(imageMap.keys()).length===0) {
            let myFavorite = ''
            if (picName===leftName) {
                myFavorite = rightName
            }else {
                myFavorite = leftName
            }
            
            Modal.success({
                content: myFavorite,
            });
            
            this.setState({
                status: EMPTY,
                fileList: [], 
                leftName: '',
                rightName: '',
                leftImage: '',
                rightImage: '',
                previewImage: '',
                imageMap:new Map()
            })
            return 
        }
        if (picName === leftName){
            const leftImageKey = this.getRandomKey(imageMap)
            const leftImage = imageMap.get(leftImageKey)
            imageMap.delete(leftImageKey)
            this.setState({imageMap, leftImage, leftName:leftImageKey, })
        } else if (picName === rightName) {
            const rightImageKey = this.getRandomKey(imageMap)
            const rightImage = imageMap.get(rightImageKey)
            imageMap.delete(rightImageKey)
            this.setState({imageMap, rightImage, rightName:rightImageKey, })
        }
    }

    startGame = async ()=> {
        const {fileList, imageMap} = this.state
        
        if(fileList.length < 2) {
            return
        }
        for(let i = 0; i < fileList.length; i++) {
            const f = fileList[i]
            const image = await getBase64(f)
            const picName = f.name.split('.')[0]
            imageMap.set(picName, image)
        }
        const leftImageKey = this.getRandomKey(imageMap)
        const leftImage = imageMap.get(leftImageKey)
        imageMap.delete(leftImageKey)

        const rightImageKey = this.getRandomKey(imageMap)
        const rightImage = imageMap.get(rightImageKey)
        imageMap.delete(rightImageKey)
        
        this.setState({imageMap, leftImage, rightImage, leftName:leftImageKey, rightName: rightImageKey, status: INGAME})
    }

    renderCards() {
        const {fileList, previewImage, leftImage, rightImage, leftName, rightName, status} = this.state
        console.log(previewImage)
        if (status !== INGAME) {
            return null
        }
        if (fileList.length <2) {
            return null
        }

        
        return (<Row>
            <Col span={12}>
                <Card
                    hoverable
                    style={{ width: 240 }}
                    cover={<img alt="left" src={leftImage} />}
                    onClick={()=>this.cardOnClick(leftName)}
                >
                    <Meta title={leftName} description="Click to pass" />
                </Card>
            </Col>
            <Col span={12}>
                <Card
                    hoverable
                    style={{ width: 240 }}
                    cover={<img alt="right" src={rightImage} />}
                    onClick={()=>this.cardOnClick(rightName)}
                >
                    <Meta title={rightName} description="Click to pass" />
                </Card>
            </Col>
            
        </Row>)
    }
    

    render() {
        const {fileList, status} = this.state  
        const props = {
            fileList,
            onRemove: (file) => {
                const {fileList} = this.state
                const newFileList = fileList.filter((item)=>item.name !== file.name)
                this.setState({ fileList: newFileList})
                if (newFileList.length === 0) {
                    this.setState({ status: EMPTY })
                }
            },
            beforeUpload: (f) => {
                const {fileList} = this.state
                const idx = fileList.findIndex((item) => item.name===f.name)
                if (idx === -1) {
                    fileList.push(f)
                } else {
                    fileList[idx] = f
                }
                
                this.setState({ fileList, status: UPLOADING })
                return false
            },
            multiple: true,
        }
        
        return (
            <Row>
                <Col span={6}>
                </Col>
                <Col span={12}>
                    <h1>MY FAVORITE</h1>
                    <div className="padding-t padding-b">
                        {status === UPLOADING && <Button type="primary" onClick={this.startGame} > 
                            Start Game!
                        </Button>}
                    </div>
                    <div>
                    {(status === EMPTY || status === UPLOADING) &&<Upload {...props}>
                            <Button>
                                <UploadOutlined /> Upload
                            </Button>
                        </Upload>}
                    </div>
                    {this.renderCards()}
                    
                </Col>
                
                <Col span={6}>
                </Col>
            </Row>
        )
    }
}
export default ImageProcessComponent