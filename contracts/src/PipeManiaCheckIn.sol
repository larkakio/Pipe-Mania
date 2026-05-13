// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily check-in on Base. Users pay gas only; ETH transfers are rejected.
contract PipeManiaCheckIn {
    mapping(address => uint256) public lastCheckInTimestamp;

    event CheckedIn(address indexed user, uint256 timestamp);

    error MustSendZeroEth();
    error AlreadyCheckedInToday();

    /// @dev One successful check-in per UTC calendar day (epoch day boundaries).
    function checkIn() external payable {
        if (msg.value != 0) revert MustSendZeroEth();

        uint256 prior = lastCheckInTimestamp[msg.sender];
        uint256 today = block.timestamp / 1 days;
        if (prior != 0 && prior / 1 days == today) {
            revert AlreadyCheckedInToday();
        }

        lastCheckInTimestamp[msg.sender] = block.timestamp;
        emit CheckedIn(msg.sender, block.timestamp);
    }
}
