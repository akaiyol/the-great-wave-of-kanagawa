import test from 'node:test';
import assert from 'node:assert/strict';
import {Camera} from '../src/camera.mjs';

test('reduced motion starts paused and manual exploration is available',()=>{
  const camera=new Camera({reducedMotion:true});camera.tick(0,900);camera.tick(50,900);assert.equal(camera.x,0);
  camera.move(-100);assert.equal(camera.x,-100);assert.equal(camera.playing,false);
  camera.toggle();camera.tick(100,900);camera.tick(150,900);assert.equal(camera.x,-99.5);
});
test('manual travel pauses, visibility changes preserve position without catch-up',()=>{
  const c=new Camera();c.tick(0,900);c.tick(50,900);assert.equal(c.x,.5);
  c.move(100);c.tick(100,900);assert.equal(c.x,100.5);assert.equal(c.playing,false);
  c.toggle();c.tick(150,900);c.setVisible(false);c.tick(10000,900);assert.equal(c.x,100.5);
  c.setVisible(true);c.tick(20000,900);assert.equal(c.x,100.5);c.tick(20050,900);assert.equal(c.x,101);
  c.reduceMotion();c.tick(20100,900);assert.equal(c.x,101);
});
