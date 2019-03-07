module.exports = function WorldBoss(mod) {
	
	let {
		enabled,
		alerted,
		messager,
		marker,
		itemId,
		bosses
	} = require('./config.json')
	
	let bossName,
		mobid = []
	
	mod.command.add('怪物', (arg) => {
		if (!arg) {
			enabled = !enabled
			sendMessage('模块 ' + enabled ? BLU('开启') : YEL('关闭') )
			if (!enabled) {
				for (let i of mobid) {
					despawnItem(i)
				}
			}
		} else {
			switch (arg) {
				case '通知':
					alerted = !alerted
					sendMessage('通知 ' + alerted ? BLU('启用') : YEL('禁用') )
					break
				case '记录':
					messager = !messager
					sendMessage('记录 ' + messager ? BLU('启用') : YEL('禁用') )
					break
				case '标记':
					marker = !marker
					sendMessage('标记 ' + marker ? BLU('启用') : YEL('禁用') )
					break
				case '清除':
					sendMessage(TIP('清除怪物标记'))
					for (let i of mobid) {
						despawnItem(i)
					}
					break
				default:
					sendMessage(RED('参数错误!'))
					break
			}
		}
	})
	
	mod.hook('S_LOAD_TOPO', 3, () => {
		mobid = []
	})
	
	mod.hook('S_SPAWN_NPC', 11, (event) => {
		let boss
		if (enabled && (boss = bosses.filter(b => b.huntingZoneId.includes(event.huntingZoneId) && b.templateId === event.templateId)[0])) {
			bossName = boss.name
			if (marker) {
				spawnItem(event.gameId, event.loc)
				mobid.push(event.gameId)
			}
			if (alerted) {
				noticeMessage('发现: ' + bossName)
			}
			if (messager) {
				sendMessage('发现: ' + TIP(bossName))
			}
		}
	})
	
	mod.hook('S_DESPAWN_NPC', 3, {order: -100}, (event) => {
		if (mobid.includes(event.gameId)) {
			if (alerted && bossName) {
				if (event.type == 5) {
					if (alerted) {
						noticeMessage(bossName + ' 被击杀')
					}
					if (messager) {
						sendMessage(TIP(bossName) + ' 被击杀')
					}
				} else if (event.type == 1) {
					if (alerted) {
						noticeMessage(bossName + ' 超出范围...')
					}
					if (messager) {
						sendMessage(TIP(bossName) + ' 超出范围...')
					}
				}
			}
			bossName = null
			despawnItem(event.gameId)
			mobid.splice(mobid.indexOf(event.gameId), 1)
		}
	})
	
	function spawnItem(gameId, loc) {
		loc.z = loc.z - 100
		mod.send('S_SPAWN_DROPITEM', 6, {
			gameId: gameId*100n,
			loc: loc,
			item: itemId,
			amount: 1,
			expiry: 600000,
			owners: [{
				id: 0
			}]
		})
	}
	
	function despawnItem(gameId) {
		mod.send('S_DESPAWN_DROPITEM', 4, {
			gameId: gameId*100n
		})
	}
	
	function noticeMessage(msg) {
		mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
			type: 44,
			chat: 0,
			channel: 0,
			message: msg
		})
	}
	
	function sendMessage(msg) {
		mod.command.message(msg)
	}
		
	function BLU(bluetext) {
		return '<font color="#56B4E9">' + bluetext + '</font>'
	}
	
	function YEL(yellowtext) {
		return '<font color="#E69F00">' + yellowtext + '</font>'
	}
		
	function RED(redtext) {
		return '<font color="#FF0000">' + redtext + '</font>'
	}
	
	function TIP(tipsText) {
		return '<font color="#00FFFF">' + tipsText + '</font>'
	}
	
}
