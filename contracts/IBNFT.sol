pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract IBModel is ERC721 {
    using Counters for Counters.Counter;

    // () = createTask => TODO
    // TODO => takeTask => IN_PROGRESS
    // IN_PROGRESS => submitTask => REVIEW
    // REVIEW => verifyTask => VERIFIED

    enum TrainingState { TODO, IN_PROGRESS, IN_REVIEW, VERIFIED, REJECTED }

    struct TrainingTask {
        string Name;
        string DetailUri;
        string ResultUri;
        TrainingState State;
    }

    constructor() ERC721("Intelligence Backed NFT", "IBNFT") public {  
    }

    Counters.Counter private _taskIds;

    mapping(uint256 => TrainingTask) _taskMapping;

    event TaskToTodo(address creator, uint256 taskId, string name);
    event TaskToInProgress(address creator, uint256 taskId);
    event TaskToReview(address creator, uint256 taskId);
    event TaskToVerified(address creator, uint256 taskId);
    event TaskToRejected(address creator, uint256 taskId);

    modifier OnlyTaskInState(uint256 taskId, TrainingState state) {
        require(_taskMapping[taskId].State == state);
        _;
    }

    modifier OnlyTaskInState2(uint256 taskId, TrainingState state1, TrainingState state2) {
        require(_taskMapping[taskId].State == state1 || _taskMapping[taskId].State == state2);
        _;
    }

    function getTaskState(uint256 taskId) public view returns(TrainingState) {
        return _taskMapping[taskId].State;
    }

    function createTask(address owner, string memory taskDetailUri, string memory name) public returns (uint256) {
        _taskIds.increment();

        uint256 newTaskId = _taskIds.current();
        _mint(owner, newTaskId);
        _taskMapping[newTaskId].Name = name;
        _taskMapping[newTaskId].DetailUri = taskDetailUri;
        _taskMapping[newTaskId].State = TrainingState.TODO;
        emit TaskToTodo(msg.sender, newTaskId, name);
        return newTaskId;
    }

    function takeTask(address owner, uint256 taskId) OnlyTaskInState2(taskId, TrainingState.TODO, TrainingState.REJECTED) public {
        // function _transfer(address from, address to, uint256 tokenId)
        require(balanceOf(msg.sender) == 0, "Sender has alrady taken one task.");
        require(_taskMapping[taskId].State == TrainingState.TODO || _taskMapping[taskId].State == TrainingState.REJECTED, "TrainingTask must be in TODO or REJECTED state to be taken.");
        _safeTransfer(owner, msg.sender, taskId, "");
        _taskMapping[taskId].State = TrainingState.IN_PROGRESS;
        emit TaskToInProgress(msg.sender, taskId);
    }

    function submitTask(address owner, uint256 taskId, string memory resultUri) OnlyTaskInState(taskId, TrainingState.IN_PROGRESS) public {
        // function _transfer(address from, address to, uint256 tokenId)
        require(ownerOf(taskId) == msg.sender);
        _taskMapping[taskId].ResultUri = resultUri;
        _safeTransfer(msg.sender, owner, taskId, "");
        _taskMapping[taskId].State = TrainingState.IN_REVIEW;
        emit TaskToReview(msg.sender, taskId);
    }

    function verifyTask(address owner, uint256 taskId) OnlyTaskInState(taskId, TrainingState.IN_REVIEW) public {
        // function _transfer(address from, address to, uint256 tokenId)
        require(ownerOf(taskId) == msg.sender);
        _safeTransfer(msg.sender, owner, taskId, "");
        _taskMapping[taskId].State = TrainingState.VERIFIED;
        emit TaskToVerified(msg.sender, taskId);
    }

    function rejectTask(address owner, uint256 taskId) OnlyTaskInState(taskId, TrainingState.IN_REVIEW) public {
        // function _transfer(address from, address to, uint256 tokenId)
        require(ownerOf(taskId) == msg.sender);
        _safeTransfer(msg.sender, owner, taskId, "");
        _taskMapping[taskId].State = TrainingState.REJECTED;
        emit TaskToRejected(msg.sender, taskId);
    }
}
