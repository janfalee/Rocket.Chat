import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Box, Table, Avatar, Icon, TextInput, Field, CheckBox, Margins } from '@rocket.chat/fuselage';
import { useMediaQuery } from '@rocket.chat/fuselage-hooks';

import { GenericTable, Th } from '../../../../ui/client/components/GenericTable';
import { useTranslation } from '../../../../../client/contexts/TranslationContext';
import { roomTypes } from '../../../../utils/client';

const style = { whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' };

export const DEFAULT_TYPES = ['d', 'p', 'c'];

const roomTypeI18nMap = {
	l: 'Omnichannel',
	c: 'Channel',
	d: 'Direct',
	p: 'Group',
	discussion: 'Discussion',
};

const FilterByTypeAndText = ({ setFilter, ...props }) => {
	const [text, setText] = useState('');
	const [types, setTypes] = useState({ d: false, c: false, p: false, l: false, discussion: false });

	const t = useTranslation();

	const handleChange = useCallback((event) => setText(event.currentTarget.value), []);
	const handleCheckBox = useCallback((type) => setTypes({ ...types, [type]: !types[type] }), [types]);

	useEffect(() => {
		if (Object.values(types).filter(Boolean).length === 0) {
			return setFilter({ text, types: DEFAULT_TYPES });
		}
		const _types = Object.entries(types).filter(([, value]) => Boolean(value)).map(([key]) => key);
		setFilter({ text, types: _types });
	}, [text, types]);

	return <Box mb='x16' is='form' display='flex' flexDirection='column' {...props}>
		<TextInput placeholder={t('Search_Rooms')} addon={<Icon name='magnifier' size='x20'/>} onChange={handleChange} value={text} />
		<Field>
			<Box display='flex' flexDirection='row' flexWrap='wrap' justifyContent='flex-start' mb='x8' mi='neg-x8'>
				<Margins inline='x8'>
					<Field.Row>
						<CheckBox checked={types.d} onClick={() => handleCheckBox('d')}/>
						<Field.Label>{t('Direct')}</Field.Label>
					</Field.Row>
					<Field.Row>
						<CheckBox checked={types.c} onClick={() => handleCheckBox('c')}/>
						<Field.Label>{t('Public')}</Field.Label>
					</Field.Row>
					<Field.Row>
						<CheckBox checked={types.p} onClick={() => handleCheckBox('p')}/>
						<Field.Label>{t('Private')}</Field.Label>
					</Field.Row>
					<Field.Row>
						<CheckBox checked={types.l} onClick={() => handleCheckBox('l')}/>
						<Field.Label>{t('Omnichannel')}</Field.Label>
					</Field.Row>
					<Field.Row mie='none'>
						<CheckBox checked={types.discussions} onClick={() => handleCheckBox('discussions')}/>
						<Field.Label>{t('Discussions')}</Field.Label>
					</Field.Row>
				</Margins>
			</Box>
		</Field>
	</Box>;
};

export function AdminRooms({
	sort,
	data,
	onHeaderClick,
	onClick,
	setParams,
	params,
}) {
	const t = useTranslation();


	const mediaQuery = useMediaQuery('(min-width: 1024px)');

	const header = useMemo(() => [
		<Th key={'name'} direction={sort[1]} active={sort[0] === 'name'} onClick={onHeaderClick} sort='name' w='x200'>{t('Name')}</Th>,
		<Th key={'type'} direction={sort[1]} active={sort[0] === 't'} onClick={onHeaderClick} sort='t' w='x100'>{t('Type')}</Th>,
		<Th key={'users'} direction={sort[1]} active={sort[0] === 'usersCount'} onClick={onHeaderClick} sort='usersCount' w='x80'>{t('Users')}</Th>,
		mediaQuery && <Th key={'messages'} direction={sort[1]} active={sort[0] === 'msgs'} onClick={onHeaderClick} sort='msgs' w='x80'>{t('Msgs')}</Th>,
		mediaQuery && <Th key={'default'} direction={sort[1]} active={sort[0] === 'default'} onClick={onHeaderClick} sort='default' w='x80' >{t('Default')}</Th>,
		mediaQuery && <Th key={'featured'} direction={sort[1]} active={sort[0] === 'featured'} onClick={onHeaderClick} sort='featured' w='x80'>{t('Featured')}</Th>,
	].filter(Boolean), [sort, mediaQuery]);

	const renderRow = useCallback(({ _id, name, t: type, usersCount, msgs, default: isDefault, featured, usernames, ...args }) => {
		const icon = roomTypes.getIcon({ t: type, usernames, ...args });
		const roomName = type === 'd' ? usernames.join(' x ') : roomTypes.getRoomName(type, { name, type, _id, ...args });
		const avatarUrl = roomTypes.getConfig(type).getAvatarPath({ name, type, _id, ...args });
		return <Table.Row key={_id} onKeyDown={onClick(_id)} onClick={onClick(_id)} tabIndex={0} role='link' action>
			<Table.Cell style={style}>
				<Box display='flex' alignContent='center'>
					<Avatar size={mediaQuery ? 'x28' : 'x40'} title={avatarUrl} url={avatarUrl} />
					<Box display='flex' style={style} mi='x8'>
						<Box display='flex' flexDirection='row' alignSelf='center' alignItems='center' style={style}>
							<Icon mi='x2' name={icon === 'omnichannel' ? 'livechat' : icon} textStyle='p2' textColor='hint'/><Box textStyle='p2' style={style} textColor='default'>{roomName}</Box>
						</Box>
					</Box>
				</Box>
			</Table.Cell>
			<Table.Cell>
				<Box textStyle='p2' style={style} textColor='hint'>{ t(roomTypeI18nMap[type]) }</Box> <Box mi='x4'/>
			</Table.Cell>
			<Table.Cell style={style}>{usersCount}</Table.Cell>
			{mediaQuery && <Table.Cell style={style}>{msgs}</Table.Cell>}
			{mediaQuery && <Table.Cell style={style}>{isDefault ? t('True') : t('False')}</Table.Cell>}
			{mediaQuery && <Table.Cell style={style}>{featured ? t('True') : t('False')}</Table.Cell>}
		</Table.Row>;
	}, [mediaQuery]);

	return <GenericTable FilterComponent={FilterByTypeAndText} header={header} renderRow={renderRow} results={data.rooms} total={data.total} setParams={setParams} params={params}/>;
}