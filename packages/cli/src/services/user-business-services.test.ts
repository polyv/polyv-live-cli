import { ProductServiceSdk } from './product.service.sdk';
import { InviteSalesServiceSdk } from './invite-sales-service';
import { CustomFieldServiceSdk } from './custom-field-service';
import { mockAuthConfig, mockServiceConfig } from '../utils/test-helpers';
import { createSdkClient } from '../sdk';

jest.mock('../sdk', () => ({
  createSdkClient: jest.fn(),
}));

const mockCreateSdkClient = createSdkClient as jest.MockedFunction<typeof createSdkClient>;

describe('user business service wrappers', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      v4User: {
        listProducts: jest.fn().mockResolvedValue({ contents: [] }),
        createProduct: jest.fn().mockResolvedValue('product-1'),
        updateProduct: jest.fn().mockResolvedValue(undefined),
        deleteProduct: jest.fn().mockResolvedValue(undefined),
        listProductTags: jest.fn().mockResolvedValue({ contents: [] }),
        createProductTag: jest.fn().mockResolvedValue({ id: 1, name: 'Hot' }),
        updateProductTag: jest.fn().mockResolvedValue(undefined),
        deleteProductTag: jest.fn().mockResolvedValue(undefined),
        listProductOrders: jest.fn().mockResolvedValue({ contents: [] }),
        getProductOrder: jest.fn().mockResolvedValue({ orderNo: 'order-1', status: 'paid' }),
        batchUpdateOrderStatus: jest.fn().mockResolvedValue({ successOrderNos: ['order-1'] }),
        listInviteSales: jest.fn().mockResolvedValue({ contents: [] }),
        addInviteSale: jest.fn().mockResolvedValue(undefined),
        updateInviteSale: jest.fn().mockResolvedValue(undefined),
        removeInviteSale: jest.fn().mockResolvedValue(undefined),
        listFollowViewers: jest.fn().mockResolvedValue({ contents: [] }),
        listCustomFields: jest.fn().mockResolvedValue([]),
        addCustomField: jest.fn().mockResolvedValue(undefined),
        addCustomFieldValue: jest.fn().mockResolvedValue(undefined),
      },
    };
    mockCreateSdkClient.mockReturnValue(mockClient);
  });

  it('delegates user product library, tag, and order methods to V4UserService', async () => {
    const service = new ProductServiceSdk(mockAuthConfig, mockServiceConfig);

    await service.listUserProducts({ page: 2, size: 10, keyword: 'demo' });
    await service.createUserProduct({ name: 'Demo', linkType: 10, link: 'https://example.com', tagIds: '1,2' });
    await service.updateUserProduct({ productId: 'p1', name: 'Demo', linkType: 10, link: 'https://example.com' });
    await service.deleteUserProduct({ productId: 'p1' });
    await service.listProductTags({ channelId: '3151318', page: 1, size: 10 });
    await service.createProductTag({ name: 'Hot' });
    await service.updateProductTag({ id: 1, name: 'New Hot' });
    await service.deleteProductTag({ id: 1 });
    await service.listProductOrders({ page: 1, size: 20 });
    await service.getProductOrder({ orderNo: 'order-1' });
    await service.batchUpdateProductOrderStatus({ orderNos: 'order-1,order-2', status: 'delivering' });

    expect(mockClient.v4User.listProducts).toHaveBeenCalledWith({ pageNumber: 2, pageSize: 10, keyword: 'demo' });
    expect(mockClient.v4User.createProduct).toHaveBeenCalledWith(expect.objectContaining({ name: 'Demo', tagIds: [1, 2] }));
    expect(mockClient.v4User.updateProduct).toHaveBeenCalledWith(expect.objectContaining({ productId: 'p1' }));
    expect(mockClient.v4User.deleteProduct).toHaveBeenCalledWith({ productId: 'p1' });
    expect(mockClient.v4User.listProductTags).toHaveBeenCalledWith({ channelId: '3151318', pageNumber: 1, pageSize: 10 });
    expect(mockClient.v4User.createProductTag).toHaveBeenCalledWith({ name: 'Hot' });
    expect(mockClient.v4User.updateProductTag).toHaveBeenCalledWith({ id: 1, name: 'New Hot' });
    expect(mockClient.v4User.deleteProductTag).toHaveBeenCalledWith({ id: 1 });
    expect(mockClient.v4User.listProductOrders).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 20 });
    expect(mockClient.v4User.getProductOrder).toHaveBeenCalledWith({ orderNo: 'order-1' });
    expect(mockClient.v4User.batchUpdateOrderStatus).toHaveBeenCalledWith({ orderNos: ['order-1', 'order-2'], status: 'delivering' });
  });

  it('delegates invite sales methods to V4UserService', async () => {
    const service = new InviteSalesServiceSdk(mockAuthConfig, mockServiceConfig);

    await service.listInviteSales({ pageNumber: 1, pageSize: 10 });
    await service.addInviteSale({ viewerUnionIds: ['v1'] });
    await service.updateInviteSale({ viewerUnionIds: ['v1'], organizationId: 1 });
    await service.removeInviteSale({ viewerUnionIds: ['v1'] });
    await service.listFollowViewers({ viewerId: 'viewer-1' });

    expect(mockClient.v4User.listInviteSales).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 10 });
    expect(mockClient.v4User.addInviteSale).toHaveBeenCalledWith({ viewerUnionIds: ['v1'] });
    expect(mockClient.v4User.updateInviteSale).toHaveBeenCalledWith({ viewerUnionIds: ['v1'], organizationId: 1 });
    expect(mockClient.v4User.removeInviteSale).toHaveBeenCalledWith({ viewerUnionIds: ['v1'] });
    expect(mockClient.v4User.listFollowViewers).toHaveBeenCalledWith({ viewerId: 'viewer-1' });
  });

  it('delegates custom field methods to V4UserService', async () => {
    const service = new CustomFieldServiceSdk(mockAuthConfig, mockServiceConfig);

    await service.listCustomFields();
    await service.addCustomField({ customFieldId: 'PAY_STATUS', customFieldName: 'Pay Status', customFieldType: 'text' });
    await service.addCustomFieldValue([{ viewerId: 'viewer-1', customFieldId: 'PAY_STATUS', customFieldValue: 'paid' }]);

    expect(mockClient.v4User.listCustomFields).toHaveBeenCalledWith();
    expect(mockClient.v4User.addCustomField).toHaveBeenCalledWith({ customFieldId: 'PAY_STATUS', customFieldName: 'Pay Status', customFieldType: 'text' });
    expect(mockClient.v4User.addCustomFieldValue).toHaveBeenCalledWith([{ viewerId: 'viewer-1', customFieldId: 'PAY_STATUS', customFieldValue: 'paid' }]);
  });
});
