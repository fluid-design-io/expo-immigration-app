import { StyledLucideIcon } from '@/components/styled-icon'
import { useMutation, useQuery } from 'convex/react'
import { Button, Checkbox, ListGroup, Separator, Spinner } from 'heroui-native'
import { EmptyState } from 'heroui-native-pro'
import { Fragment } from 'react'
import { Alert, View } from 'react-native'
import { api } from '../../convex/_generated/api'

export default function Test() {
	const todos = useQuery(api.todos.list)
	const createTodo = useMutation(api.todos.createTodoAndSendNotification)
	const deleteTodo = useMutation(api.todos.deleteTodo)
	const toggleTodo = useMutation(api.todos.toggleTodo)
	const handleCreateTodo = async () => {
		try {
			await createTodo({ title: 'Test Todo', description: 'Test Description' })
		} catch (error) {
			Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred')
		}
	}
	if (todos === undefined) {
		return <Spinner />
	}
	if (todos === null || todos.length === 0) {
		return (
			<View className="flex-1 pt-safe-offset-16 px-5 gap-5 pb-safe-offset-5 justify-between">
				<EmptyState>
					<EmptyState.Header>
						<EmptyState.Media variant="icon">
							<StyledLucideIcon name="check-circle" size={20} className="text-accent" />
						</EmptyState.Media>
						<EmptyState.Title>No todos yet</EmptyState.Title>
						<EmptyState.Description>Create a todo to get started.</EmptyState.Description>
					</EmptyState.Header>
					<EmptyState.Content className="w-full gap-2.5">
						<Button className="w-full max-w-xs" onPress={handleCreateTodo}>
							Create Todo
						</Button>
					</EmptyState.Content>
				</EmptyState>
			</View>
		)
	}
	return (
		<View className="flex-1 pt-safe-offset-16 px-5 gap-5 pb-safe-offset-5 justify-between">
			<ListGroup>
				{todos.map((todo, index) => (
					<Fragment key={todo._id}>
						<ListGroup.Item key={todo._id} onPress={() => toggleTodo({ id: todo._id })}>
							<ListGroup.ItemPrefix>
								<Checkbox isSelected={todo.completed} isDisabled />
							</ListGroup.ItemPrefix>
							<ListGroup.ItemContent>
								<ListGroup.ItemTitle>{todo.title}</ListGroup.ItemTitle>
								<ListGroup.ItemDescription>{todo.description}</ListGroup.ItemDescription>
							</ListGroup.ItemContent>
							<ListGroup.ItemSuffix>
								<Button
									size="sm"
									onPress={() => deleteTodo({ id: todo._id })}
									variant="danger-soft"
									isIconOnly
								>
									<StyledLucideIcon name="trash" size={18} className="text-danger" />
								</Button>
							</ListGroup.ItemSuffix>
						</ListGroup.Item>
						{index !== todos.length - 1 && <Separator />}
					</Fragment>
				))}
			</ListGroup>
			<Button onPress={handleCreateTodo}>
				<Button.Label>Create Todo</Button.Label>
			</Button>
		</View>
	)
}
