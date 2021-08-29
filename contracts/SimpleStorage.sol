// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

contract SimpleStorage{
    uint public count=0;
    mapping(uint=>File) public files;
    
    struct File{
        uint id;
        string fileHash;
        uint fileSize;
        string fileType;
        string fileName;
        string fileDescription;
        uint uploadTime;
        address uploader;
    }

    event fileUploaded(
        uint id,
        string fileHash,
        uint fileSize,
        string fileType,
        string fileName,
        string fileDescription,
        uint uploadTime,
        address uploader
    );
    
    function uploadFile(string memory _fileHash, uint _fileSize, string memory _fileType, string memory _fileName, string memory _fileDescription) public payable{
        require(bytes(_fileHash).length>0);
        require(bytes(_fileType).length>0);
        require(bytes(_fileDescription).length>0);
        require(bytes(_fileName).length>0);
        require(bytes(_fileType).length>0);
        require(_fileSize>0);
        
        require(msg.sender!=address(0));

        count++;

        //add file to map
        files[count]=File(count, _fileHash, _fileSize, _fileType, _fileName, _fileDescription, block.timestamp, msg.sender);

        emit fileUploaded(count, _fileHash, _fileSize, _fileType, _fileName, _fileDescription, block.timestamp, msg.sender);
    }
}