module.exports = function WorldBoss(mod) {
	const command = mod.command || mod.require.command;
	
	if (mod.proxyAuthor !== 'caali') {
		const options = require('./module').options
		if (options) {
			const settingsVersion = options.settingsVersion
			if (settingsVersion) {
				mod.settings = require('./' + (options.settingsMigrator || 'settings_migrator.js'))(mod.settings._version, settingsVersion, mod.settings)
				mod.settings._version = settingsVersion
			}
		}
	}
	
	let mobid = [],
		bossName
	
	mod.command.add('怪物', (arg) => {
		if (!arg) {
			mod.settings.enabled = !mod.settings.enabled
			sendMessage('模块 ' + mod.settings.enabled ? BLU('开启') : YEL('关闭') )
			if (!mod.settings.enabled) {
				for (let i of mobid) {
					despawnItem(i)
				}
			}
		} else {
			switch (arg) {
				case '通知':
					mod.settings.alerted = !mod.settings.alerted
					sendMessage('通知 ' + mod.settings.alerted ? BLU('启用') : YEL('禁用') )
					break
				case '记录':
					mod.settings.messager = !mod.settings.messager
					sendMessage('记录 ' + mod.settings.messager ? BLU('启用') : YEL('禁用') )
					break
				case '标记':
					mod.settings.marker = !mod.settings.marker
					sendMessage('标记 ' + mod.settings.marker ? BLU('启用') : YEL('禁用') )
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
	
	mod.game.me.on('change_zone', (zone, quick) => {
		mobid = []
	})
	
	mod.hook('S_SPAWN_NPC', 11, (event) => {
		let boss
		if (mod.settings.enabled && (boss = mod.settings.bosses.find(b => b.huntingZoneId === event.huntingZoneId && b.templateId === event.templateId))) {
			bossName = boss.name
			if (mod.settings.marker) {
				spawnItem(event.gameId, event.loc)
				mobid.push(event.gameId)
			}
			if (mod.settings.alerted) {
				noticeMessage('发现: ' + bossName)
			}
			if (mod.settings.messager) {
				sendMessage('发现: ' + TIP(bossName))
			}
		}
	})
	
	mod.hook('S_DESPAWN_NPC', 3, {order: -100}, (event) => {
		if (mobid.includes(event.gameId)) {
			if (mod.settings.alerted && bossName) {
				if (event.type == 5) {
					if (mod.settings.alerted) {
						noticeMessage(bossName + ' 被击杀')
					}
					if (mod.settings.messager) {
						sendMessage(TIP(bossName) + ' 被击杀')
					}
				} else if (event.type == 1) {
					if (mod.settings.alerted) {
						noticeMessage(bossName + ' ...超出范围')
					}
					if (mod.settings.messager) {
						sendMessage(TIP(bossName) + ' ...超出范围')
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
		mod.send('S_SPAWN_DROPITEM', 7, {
			gameId: gameId*100n,
			loc: loc,
			item: mod.settings.itemId,
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
		command.message(msg)
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
