// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PipeManiaCheckIn} from "../src/PipeManiaCheckIn.sol";

contract PipeManiaCheckInTest is Test {
    event CheckedIn(address indexed user, uint256 timestamp);

    PipeManiaCheckIn internal c;

    address internal alice = address(0xA11CE);

    function setUp() public {
        c = new PipeManiaCheckIn();
        vm.deal(alice, 100 ether);
    }

    function test_CheckIn_EmitsAndStoresDay() public {
        vm.startPrank(alice);
        vm.expectEmit(true, false, false, true);
        emit CheckedIn(alice, block.timestamp);
        c.checkIn();
        vm.stopPrank();

        assertEq(c.lastCheckInTimestamp(alice), block.timestamp);
    }

    function test_RevertWhenSendingEth() public {
        vm.startPrank(alice);
        vm.expectRevert(PipeManiaCheckIn.MustSendZeroEth.selector);
        c.checkIn{value: 1 wei}();
        vm.stopPrank();
    }

    function test_RevertDoubleSameDay() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.expectRevert(PipeManiaCheckIn.AlreadyCheckedInToday.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_AllowsNextUtcDay() public {
        vm.startPrank(alice);
        c.checkIn();

        vm.warp(block.timestamp + 1 days);
        c.checkIn();

        assertEq(c.lastCheckInTimestamp(alice), block.timestamp);
        vm.stopPrank();
    }
}
