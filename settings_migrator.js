const DefaultSettings = {
    "enabled": true,
    "alerted": true,
    "messager": true,
    "marker": true,
    "itemId": 98260,
    "bosses": [
        {huntingZoneId: 10,   templateId: 99,   name: "蛇岛 - 莎夏拉克"},
        {huntingZoneId: 4,    templateId: 5011, name: "爆炎 - 暴风喀纳什"},
        {huntingZoneId: 38,   templateId: 35,   name: "古代 - 溃斯格连"},
        {huntingZoneId: 57,   templateId: 33,   name: "孵化 - 卡恰斯坦"},
        {huntingZoneId: 51,   templateId: 7011, name: "蜘蛛 - 拉其奴亚"},
        {huntingZoneId: 52,   templateId: 9050, name: "蜥蜴 - 史内格斗司"},

        {huntingZoneId: 1023, templateId: 3000,     name: "活動 - 杜利溫的幻影"},
        {huntingZoneId: 1023, templateId: 20150805, name: "活動 - 杜利溫的幻影"},

        {huntingZoneId: 1023, templateId: 88888888, name: "活動-寶物箱"},
        {huntingZoneId: 1023, templateId: 88888889, name: "活動-寶物箱"},

        {huntingZoneId: 1023, templateId: 160341,   name: "聖誕老人"},
        {huntingZoneId: 1023, templateId: 99999997, name: "貪心鬼聖誕老人"},
        {huntingZoneId: 1023, templateId: 99999998, name: "小氣鬼聖誕老人"},

        {huntingZoneId: 1023, templateId: 99999991, name: "偷蛋賊西奴斯"},
        {huntingZoneId: 1023, templateId: 99999992, name: "偷蛋賊西奴斯"},
        {huntingZoneId: 1023, templateId: 99999999, name: "偷蛋賊西奴斯"},

        {huntingZoneId: 183,  templateId: 6002, name: "空投"},

        {huntingZoneId: 26,   templateId: 5001, name: "生命溪谷 - 奧勒曇"},
        {huntingZoneId: 39,   templateId: 501,  name: "迷亞阿拉克內雅 - 哈迦叻"},
        {huntingZoneId: 51,   templateId: 4001, name: "野獸高原 - 蓋洛司"}
    ]
};

module.exports = function MigrateSettings(from_ver, to_ver, settings) {
    if (from_ver === undefined) {
        // Migrate legacy config file
        return Object.assign(Object.assign({}, DefaultSettings), settings);
    } else if (from_ver === null) {
        // No config file exists, use default settings
        return DefaultSettings;
    } else {
        // Migrate from older version (using the new system) to latest one
        if (from_ver + 1 < to_ver) {
            // Recursively upgrade in one-version steps
            settings = MigrateSettings(from_ver, from_ver + 1, settings);
            return MigrateSettings(from_ver + 1, to_ver, settings);
        }
        
        // If we reach this point it's guaranteed that from_ver === to_ver - 1, so we can implement
        // a switch for each version step that upgrades to the next version. This enables us to
        // upgrade from any version to the latest version without additional effort!
        switch(to_ver) {
            default:
                let oldsettings = settings
                
                settings = Object.assign(DefaultSettings, {});
                
                for(let option in oldsettings) {
                    if(settings[option]) {
                        settings[option] = oldsettings[option]
                    }
                }
                
                break;
        }
        
        return settings;
    }
}
