# Mod-Tracker Discord Bot

A useful Discord bot used to track new releases and updates of any Minecraft mod uploaded to [CurseForge](https://www.curseforge.com/) or [Modrinth](https://modrinth.com/).

## How to use

Start by using the `track` command to define a display name for your mod.

```
/track <mod-name>
```

Then you can use the `modrinth` or `curseforge` command to link a project to your display name.

```
/modrinth <mod-name> <id-or-slug>
# or
/curseforge <mod-name> <id>
```

> **_Note_**: Every site uses a different way to find a specific mod.<br><br> To use Modrinth's API you can specify a _project id_ or the _slug_ (found in the mod url).<br>
> For example:
>
> ```
> Labelling Containers mod:
> URL: https://modrinth.com/mod/labelling-containers
> Project ID: b2T42hfY
>
> Use `labelling-containers` or `b2T42hfY`
> ```
>
> <br>To use CurseForge's API you can only specify a _mod id_.<br>
> For example:
>
> ```
> Labelling Containers mod:
> URL: https://www.curseforge.com/minecraft/mc-mods/labelling-containers
> Project ID: 844270
>
> Use `844270`
> ```

Then you can run the `channel` command to specify a channel where you want to receive the updates:

```
/channel modrinth <mod-name> <@channel>
# or
/channel curseforge <mod-name> <@channel>
```

To delete a tracked mod you can use the `delete` command:

```
/delete <mod-name>
```

To list all your tracked mods you can use the `list` command:

```
/list
```
